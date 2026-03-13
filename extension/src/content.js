// Heatmap Rendering Logic
let heatmapOverlays = [];

console.log("Coverage Lens content script active");

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
    const components = document.querySelectorAll('[data-source-file]');
    
    components.forEach(el => {
        const filePath = el.getAttribute('data-source-file');
        const fileData = data.files.find(f => filePath.endsWith(f.name));
        if (fileData) createOverlay(el, fileData);
    });

    // Fallback for demo elements without the Vite plugin tag
    if (components.length === 0) {
        const fallbackComponents = document.querySelectorAll('button, h1');
        fallbackComponents.forEach(el => {
            let fileData = null;
            if (el.tagName === 'BUTTON') fileData = data.files.find(f => f.name === 'Button.tsx');
            if (el.tagName === 'H1') fileData = data.files.find(f => f.name === 'App.tsx');
            if (fileData) createOverlay(el, fileData);
        });
    }
}

function createOverlay(targetEl, fileData) {
    const rect = targetEl.getBoundingClientRect();
    const overlay = document.createElement('div');
    
    // Color class based on coverage percentage
    let colorClass, badgeClass;
    if (fileData.coverage >= 80) {
        colorClass = 'coverage-high';
        badgeClass = 'badge-high';
    } else if (fileData.coverage >= 50) {
        colorClass = 'coverage-med';
        badgeClass = 'badge-med';
    } else {
        colorClass = 'coverage-low';
        badgeClass = 'badge-low';
    }

    overlay.className = `coverage-lens-highlight ${colorClass}`;
    overlay.style.top = `${rect.top + window.scrollY}px`;
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;

    // Add a coverage badge
    const badge = document.createElement('span');
    badge.className = `coverage-lens-badge ${badgeClass}`;
    badge.textContent = `${fileData.coverage}%`;
    overlay.appendChild(badge);

    // Tooltip behavior
    overlay.addEventListener('mouseenter', (e) => showTooltip(e, fileData));
    overlay.addEventListener('mouseleave', hideTooltip);

    document.body.appendChild(overlay);
    heatmapOverlays.push(overlay);
}

let activeTooltip = null;

function showTooltip(e, fileData) {
    if (activeTooltip) activeTooltip.remove();

    activeTooltip = document.createElement('div');
    activeTooltip.className = 'coverage-tooltip';

    // Bar color
    let barColor = '#ef4444';
    if (fileData.coverage >= 80) barColor = '#22c55e';
    else if (fileData.coverage >= 50) barColor = '#eab308';

    // Percent color
    let percentColor = '#f87171';
    if (fileData.coverage >= 80) percentColor = '#4ade80';
    else if (fileData.coverage >= 50) percentColor = '#fbbf24';

    activeTooltip.innerHTML = `
        <div class="tooltip-filename">${fileData.name}</div>
        <div class="tooltip-bar-bg">
            <div class="tooltip-bar-fill" style="width: ${fileData.coverage}%; background: ${barColor};"></div>
        </div>
        <div class="tooltip-percent" style="color: ${percentColor};">${fileData.coverage}%</div>
    `;

    // Position near cursor
    activeTooltip.style.top = `${e.clientY + 15}px`;
    activeTooltip.style.left = `${e.clientX + 15}px`;
    document.body.appendChild(activeTooltip);
}

function hideTooltip() {
    if (activeTooltip) {
        activeTooltip.remove();
        activeTooltip = null;
    }
}

// Re-render when storage changes (new data OR toggle)
chrome.storage.onChanged.addListener((changes) => {
    if (changes.coverageData || changes.enabled) renderHeatmap();
});

// Initial render after a short delay to let SPA load
setTimeout(renderHeatmap, 1000);

// Also re-render on resize
window.addEventListener('resize', renderHeatmap);
