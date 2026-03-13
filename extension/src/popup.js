const toggleBtn = document.getElementById('toggle-btn');
const globalCoverageEl = document.getElementById('global-coverage');
const fileListEl = document.getElementById('file-list');
const lastUpdatedEl = document.getElementById('last-updated');

// --- Toggle Logic ---
chrome.storage.local.get(['enabled'], (result) => {
    updateToggleUI(result.enabled !== false);
});

toggleBtn.addEventListener('click', () => {
    chrome.storage.local.get(['enabled'], (result) => {
        const newState = !(result.enabled !== false);
        chrome.storage.local.set({ enabled: newState });
        updateToggleUI(newState);
    });
});

function updateToggleUI(isEnabled) {
    toggleBtn.textContent = isEnabled ? 'ON' : 'OFF';
    toggleBtn.style.backgroundColor = isEnabled ? '#10b981' : '#ef4444';
    toggleBtn.style.color = 'white';
}

// --- Coverage Data Display ---
function renderCoverage(data) {
    if (!data) return;

    globalCoverageEl.textContent = `${data.global}%`;

    // Color the global value
    if (data.global >= 80) globalCoverageEl.className = 'stat-value cov-high';
    else if (data.global >= 50) globalCoverageEl.className = 'stat-value cov-med';
    else globalCoverageEl.className = 'stat-value cov-low';

    // Render file list
    fileListEl.innerHTML = '';
    if (data.files && data.files.length > 0) {
        data.files.forEach(file => {
            const div = document.createElement('div');
            div.className = 'file-item';

            let covClass = 'cov-low';
            if (file.coverage >= 80) covClass = 'cov-high';
            else if (file.coverage >= 50) covClass = 'cov-med';

            div.innerHTML = `
                <span class="file-name">${file.name}</span>
                <span class="file-cov ${covClass}">${file.coverage}%</span>
            `;
            fileListEl.appendChild(div);
        });
    }
}

// Initial load
chrome.storage.local.get(['coverageData', 'lastUpdated'], (result) => {
    if (result.coverageData) {
        renderCoverage(result.coverageData);
    }
    if (result.lastUpdated) {
        const ago = Math.round((Date.now() - result.lastUpdated) / 1000);
        lastUpdatedEl.textContent = `Updated ${ago}s ago`;
    }
});
