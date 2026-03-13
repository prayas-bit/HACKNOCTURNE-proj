const toggleBtn = document.getElementById('toggle-side');

function updateUI() {
  chrome.storage.local.get(['coverageData', 'enabled'], (result) => {
    const data = result.coverageData;
    const isEnabled = result.enabled !== false;
    const globalCoverageEl = document.getElementById('global-coverage');

    if (data && globalCoverageEl) {
      globalCoverageEl.textContent = `${data.global}%`;
    }
    
    updateToggleUI(isEnabled);
  });
}

toggleBtn?.addEventListener('click', () => {
    chrome.storage.local.get(['enabled'], (result) => {
        const newState = !(result.enabled !== false);
        chrome.storage.local.set({ enabled: newState });
    });
});

function updateToggleUI(isEnabled) {
    if (toggleBtn) {
        toggleBtn.textContent = isEnabled ? 'ON' : 'OFF';
        toggleBtn.style.backgroundColor = isEnabled ? '#10b981' : '#ef4444';
        toggleBtn.style.color = 'white';
    }
}

updateUI();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && (changes.coverageData || changes.enabled)) {
    updateUI();
  }
});

console.log('Side panel script loaded');
