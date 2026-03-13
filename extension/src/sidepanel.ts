// Side panel logic to display coverage data
function updateUI() {
  chrome.storage.local.get(["coverageData", "lastUpdated"], (result) => {
    const data = result.coverageData;
    const globalCoverageEl = document.getElementById("global-coverage");
    const selectedElementEl = document.getElementById("selected-element");

    if (data && globalCoverageEl) {
      globalCoverageEl.textContent = `${data.global}%`;
      console.log("UI updated with data:", data);
    }
  });
}

// Initial update
updateUI();

// Listen for storage changes to update UI in real-time
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.coverageData) {
    updateUI();
  }
});

// Blast Radius Button
document.getElementById("blastRadiusBtn")?.addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:5174/" });
});

console.log("Side panel script loaded");
