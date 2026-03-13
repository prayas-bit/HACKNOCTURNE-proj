// Side panel logic to display coverage data
function updateUI() {
  chrome.storage.local.get(['coverageData', 'lastUpdated'], (result) => {
    const data = result.coverageData;
    const globalCoverageEl = document.getElementById('global-coverage');
    const selectedElementEl = document.getElementById('selected-element');

    if (data && globalCoverageEl) {
      globalCoverageEl.textContent = `${data.global}%`;
      
      // Update file list or other stats
      console.log('UI updated with data:', data);
    }
  });
}

// Initial update
updateUI();

// Listen for storage changes to update UI in real-time
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.coverageData) {
    updateUI();
  }
});

console.log('Side panel script loaded');
