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
    const components = document.querySelectorAll('[data-source-path]');
    
    components.forEach(el => {
    const fullPathAttr = el.getAttribute('data-source-path');
    const filePath = fullPathAttr.split(':')[0];
    
    // Find the file in our coverage data
    const fileData = data.files.find(f => f.path === filePath);

    // CHANGE: Only create overlay if fileData exists AND has coverage info
    // If there's no test, vitest (usually) won't even include it in the report
    if (fileData) {
        createOverlay(el, fileData, fullPathAttr);
    } else {
        // If it's not in the report, it means no test touched it.
        // By doing nothing here, the component stays "Transparent" (no color)
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

    overlay.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
            await fetch('http://localhost:3000/open-ide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: sourceLocation })
            });
        } catch (err) {
            console.error('Core server not found.');
        }
    });

    overlay.addEventListener('mouseenter', (e) => showTooltip(e, fileData));
    overlay.addEventListener('mouseleave', hideTooltip);

    // Append inside the element not body
    targetEl.appendChild(overlay);
    heatmapOverlays.push(overlay);
}

let activeTooltip = null;

function showTooltip(e, fileData) {
    if (activeTooltip) activeTooltip.remove();

    activeTooltip = document.createElement('div');
    activeTooltip.className = 'coverage-tooltip';

    let barColor = fileData.score >= 80 ? '#22c55e' : (fileData.score >= 50 ? '#eab308' : '#ef4444');
    let percentColor = fileData.score >= 80 ? '#4ade80' : (fileData.score >= 50 ? '#fbbf24' : '#f87171');

    activeTooltip.innerHTML = `
        <div class="tooltip-filename">${fileData.path}</div>
        <div class="tooltip-hint" style="font-size: 10px; opacity: 0.7; margin-bottom: 5px;">Click to open in VS Code</div>
        <div class="tooltip-bar-bg">
            <div class="tooltip-bar-fill" style="width: ${fileData.score}%; background: ${barColor};"></div>
        </div>
        <div class="tooltip-percent" style="color: ${percentColor};">${fileData.score}%</div>
    `;

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

// Re-render listeners
chrome.storage.onChanged.addListener((changes) => {
    if (changes.coverageData || changes.enabled) renderHeatmap();
});

setTimeout(renderHeatmap, 1000);
window.addEventListener('resize', renderHeatmap);