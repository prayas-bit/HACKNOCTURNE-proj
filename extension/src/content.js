// Heatmap Rendering Logic
let heatmapOverlays = [];

console.log("Coverage Lens content script active");

// ===== Phase 1: Inline State Map (Extension can't import ES modules from the app) =====
const STATE_MAP = {
    "src/components/Dashboard.jsx": { endpoint: "/api/v1/stats", type: "DATA_FEED" },
    "src/components/StatCard.jsx":  { endpoint: "/api/v1/stats", type: "DATA_FEED" },
    "src/components/Header.jsx":    { endpoint: null,            type: "UI_SHELL" },
    "src/components/Sidebar.jsx":   { endpoint: null,            type: "UI_SHELL" },
    "src/components/Button.jsx":    { endpoint: null,            type: "INTERACTION" },
    "src/components/RevenueChart.jsx": { endpoint: null,            type: "UI_SHELL" },
    "src/components/RecentActivity.jsx": { endpoint: null,            type: "UI_SHELL" },
    "src/components/SystemStatus.jsx": { endpoint: "/api/v1/system-status", type: "DATA_FEED" },
};

const ERROR_GROUPS = {
    DATA_FEED: [
        { code: 500, label: "Server Crash" },
        { code: 404, label: "API Missing" },
        { code: 204, label: "No Data Found" },
        { code: 429, label: "Rate Limited" },
    ],
    TRANSACTION: [
        { code: 402, label: "Payment Required" },
        { code: 403, label: "Card Declined" },
        { code: 500, label: "Server Crash" },
    ],
    UI_SHELL:    [],
    INTERACTION: [],
};

// ===== Heatmap Rendering =====

async function renderHeatmap() {
    // Clear existing overlays
    heatmapOverlays.forEach(o => o.remove());
    heatmapOverlays = [];

    const result = await chrome.storage.local.get(['coverageData', 'enabled']);
    const data = result.coverageData;
    const isEnabled = result.enabled !== false;

    if (!isEnabled) return;
    if (!data || !data.files) return;

    // Scan for elements tagged by the Vite plugin
    const components = document.querySelectorAll('[data-source-path]');
    
    components.forEach(el => {
    const fullPathAttr = el.getAttribute('data-source-path');
    const filePath = fullPathAttr.split(':')[0];
    
    // Find the file in our coverage data
    const fileData = data.files.find(f => f.path === filePath);

    if (fileData) {
        createOverlay(el, fileData, fullPathAttr);
    } else {
        console.log(`Skipping overlay for ${filePath} - No coverage data found.`);
    }
});
    // Fallback for demo elements without the Vite plugin tag
    if (components.length === 0) {
        const fallbackElements = document.querySelectorAll('div, section, header, footer, nav, main, button, h1, h2, p');
        fallbackElements.forEach((el, index) => {
            const fileData = data.files[index % data.files.length];
            if (fileData) createOverlay(el, fileData, fileData.path);
        });
    }
}

function createOverlay(targetEl, fileData, sourceLocation) {
    if (targetEl.querySelector('.coverage-lens-highlight')) return; // skip if already has overlay

    let colorClass, badgeClass;
    if (fileData.score >= 80) {
        colorClass = 'coverage-high';
        badgeClass = 'badge-high';
    } else if (fileData.score >= 50) {
        colorClass = 'coverage-med';
        badgeClass = 'badge-med';
    } else {
        colorClass = 'coverage-low';
        badgeClass = 'badge-low';
    }

    const overlay = document.createElement('div');
    overlay.className = `coverage-lens-highlight ${colorClass}`;

    // Stick to parent instead of body
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '999999';
    overlay.style.pointerEvents = 'auto';
    overlay.style.cursor = 'pointer';

    // Make parent relative so overlay sticks to it
    const originalPosition = window.getComputedStyle(targetEl).position;
    if (originalPosition === 'static') {
        targetEl.style.position = 'relative';
    }

    const badge = document.createElement('span');
    badge.className = `coverage-lens-badge ${badgeClass}`;
    badge.textContent = `${fileData.score}%`;
    overlay.appendChild(badge);

    // Click to PIN the tooltip open (instead of hover-to-show)
    overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        showTooltip(e, fileData, sourceLocation);
    });

    // Append inside the element not body
    targetEl.appendChild(overlay);
    heatmapOverlays.push(overlay);
}

let activeTooltip = null;

// ===== Phase 2: Enhanced Tooltip with Error Injection Buttons =====

function showTooltip(e, fileData, sourceLocation) {
    // Toggle: if tooltip is already open, close it
    if (activeTooltip) {
        activeTooltip.remove();
        activeTooltip = null;
        return;
    }

    activeTooltip = document.createElement('div');
    activeTooltip.className = 'coverage-tooltip coverage-tooltip-pinned';
    activeTooltip.style.pointerEvents = 'auto';

    let barColor = fileData.score >= 80 ? '#22c55e' : (fileData.score >= 50 ? '#eab308' : '#ef4444');
    let percentColor = fileData.score >= 80 ? '#4ade80' : (fileData.score >= 50 ? '#fbbf24' : '#f87171');

    // Look up this component in the state map
    const componentPath = fileData.path;
    const mapping = STATE_MAP[componentPath];
    const componentType = mapping ? mapping.type : null;
    const endpoint = mapping ? mapping.endpoint : null;
    const errors = componentType ? (ERROR_GROUPS[componentType] || []) : [];

    // Build error injection buttons HTML
    let actionsHTML = '';
    if (errors.length > 0 && endpoint) {
        const buttonsHTML = errors.map(err =>
            `<button class="tooltip-inject-btn" data-code="${err.code}" data-endpoint="${endpoint}" data-path="${componentPath}">
                ${err.code} — ${err.label}
            </button>`
        ).join('');

        actionsHTML = `
            <div class="tooltip-actions">
                <div class="tooltip-actions-label">⚡ Inject Error State:</div>
                ${buttonsHTML}
                <button class="tooltip-clear-btn" data-path="${componentPath}">🧹 Clear All Mocks</button>
            </div>
        `;
    } else if (!endpoint) {
        actionsHTML = `
            <div class="tooltip-actions">
                <div class="tooltip-actions-label" style="opacity: 0.5;">UI-only component — no API to mock</div>
            </div>
        `;
    }

    let insightsHTML = '';
    if (fileData.score < 100) {
        insightsHTML = `
            <div class="tooltip-insights">
                <div class="tooltip-insights-label">💡 Test Coverage Gaps:</div>
                <ul class="tooltip-insights-list">
                    ${fileData.score === 0 ? '<li>No tests written for this component</li>' : ''}
                    ${endpoint ? '<li>API Error states (e.g. 500, 404) might not be tested</li>' : '<li>Edge cases in UI interactions or rendering might be untested</li>'}
                    ${endpoint && fileData.score < 50 ? '<li>Missing error boundary/handling tests</li>' : ''}
                </ul>
            </div>
        `;
    }

    activeTooltip.innerHTML = `
        <div class="tooltip-header">
            <div class="tooltip-filename">${fileData.path}</div>
            <button class="tooltip-close-btn">✕</button>
        </div>
        <div class="tooltip-bar-bg">
            <div class="tooltip-bar-fill" style="width: ${fileData.score}%; background: ${barColor};"></div>
        </div>
        <div class="tooltip-percent" style="color: ${percentColor};">${fileData.score}%</div>
        ${insightsHTML}
        ${actionsHTML}
    `;

    // Position tooltip near cursor, clamped to viewport
    let top = e.clientY + 15;
    let left = e.clientX + 15;
    // Prevent going off right edge
    if (left + 220 > window.innerWidth) left = window.innerWidth - 230;
    // Prevent going off bottom
    if (top + 300 > window.innerHeight) top = e.clientY - 320;
    activeTooltip.style.top = `${top}px`;
    activeTooltip.style.left = `${left}px`;
    document.body.appendChild(activeTooltip);

    // Stop clicks inside tooltip from bubbling to the document dismiss listener
    activeTooltip.addEventListener('click', (ev) => ev.stopPropagation());

    // Close button
    activeTooltip.querySelector('.tooltip-close-btn').addEventListener('click', hideTooltip);

    // ===== Phase 3: Wire button clicks to postMessage =====
    activeTooltip.querySelectorAll('.tooltip-inject-btn').forEach(btn => {
        btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const code = parseInt(btn.dataset.code);
            const ep = btn.dataset.endpoint;
            const path = btn.dataset.path;

            console.log(`🎯 Extension: Injecting ${code} on ${ep} for ${path}`);

            window.postMessage({
                source: 'DEV_TOOL_HEATMAP',
                type: 'TRIGGER_MOCK',
                payload: {
                    path: path,
                    status: code,
                    endpoint: ep
                }
            }, "*");

            hideTooltip();
        });
    });

    const clearBtn = activeTooltip.querySelector('.tooltip-clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            console.log('🧹 Extension: Clearing all mocks');
            window.postMessage({
                source: 'DEV_TOOL_HEATMAP',
                type: 'CLEAR_MOCKS'
            }, "*");
            hideTooltip();
        });
    }
}

function hideTooltip() {
    if (activeTooltip) {
        activeTooltip.remove();
        activeTooltip = null;
    }
}

// Dismiss tooltip when clicking anywhere outside it
document.addEventListener('click', () => hideTooltip());
// Dismiss on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideTooltip();
});

// Re-render listeners
chrome.storage.onChanged.addListener((changes) => {
    if (changes.coverageData || changes.enabled) renderHeatmap();
});

setTimeout(renderHeatmap, 1000);
window.addEventListener('resize', renderHeatmap);

// ===== Persistent Floating Clear Button =====
// Shows when mocks are active so the user can always clear them

let floatingClearBtn = null;

function updateFloatingClearBtn() {
    const hasRules = localStorage.getItem('RQ_MOCKED_STATES');
    const rulesExist = hasRules && hasRules !== '{}';

    if (rulesExist && !floatingClearBtn) {
        floatingClearBtn = document.createElement('button');
        floatingClearBtn.className = 'coverage-lens-floating-clear';
        floatingClearBtn.innerHTML = '🧹 Clear Mocks';
        floatingClearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.postMessage({ source: 'DEV_TOOL_HEATMAP', type: 'CLEAR_MOCKS' }, "*");
        });
        document.body.appendChild(floatingClearBtn);
    } else if (!rulesExist && floatingClearBtn) {
        floatingClearBtn.remove();
        floatingClearBtn = null;
    }
}

// Check on load and periodically
setTimeout(updateFloatingClearBtn, 1500);
setInterval(updateFloatingClearBtn, 3000);