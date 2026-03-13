const toggleBtn = document.getElementById("toggle-btn");
const globalCoverageEl = document.getElementById("global-coverage");
const fileListEl = document.getElementById("file-list");
const lastUpdatedEl = document.getElementById("last-updated");

// --- Toggle Logic ---
chrome.storage.local.get(["enabled"], (result) => {
  updateToggleUI(result.enabled !== false);
});

toggleBtn.addEventListener("click", () => {
  chrome.storage.local.get(["enabled"], (result) => {
    const newState = !(result.enabled !== false);
    chrome.storage.local.set({ enabled: newState });
    updateToggleUI(newState);
  });
});

function updateToggleUI(isEnabled) {
  toggleBtn.textContent = isEnabled ? "ON" : "OFF";
  toggleBtn.style.backgroundColor = isEnabled ? "#10b981" : "#ef4444";
  toggleBtn.style.color = "white";
}

// --- Coverage Data Display ---
function renderCoverage(data) {
  if (!data) return;

  globalCoverageEl.textContent = `${data.global}%`;

  if (data.global >= 80) globalCoverageEl.className = "stat-value cov-high";
  else if (data.global >= 50) globalCoverageEl.className = "stat-value cov-med";
  else globalCoverageEl.className = "stat-value cov-low";

  fileListEl.innerHTML = "";
  if (data.files && data.files.length > 0) {
    data.files.forEach((file) => {
      const div = document.createElement("div");
      div.className = "file-item";

      const coverage = file.score;
      let covClass = "cov-low";
      if (coverage >= 80) covClass = "cov-high";
      else if (coverage >= 50) covClass = "cov-med";

      div.innerHTML = `
                <span class="file-name">${file.path}</span>
                <span class="file-cov ${covClass}">${coverage}%</span>
            `;
      fileListEl.appendChild(div);
    });
  }
}

// Initial load
chrome.storage.local.get(["coverageData", "lastUpdated"], (result) => {
  if (result.coverageData) {
    renderCoverage(result.coverageData);
  }
  if (result.lastUpdated) {
    const ago = Math.round((Date.now() - result.lastUpdated) / 1000);
    lastUpdatedEl.textContent = `Updated ${ago}s ago`;
  }
});

// Live updates
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && (changes.coverageData || changes.enabled)) {
    chrome.storage.local.get(["coverageData", "lastUpdated"], (result) => {
      if (result.coverageData) renderCoverage(result.coverageData);
      if (result.lastUpdated) {
        const ago = Math.round((Date.now() - result.lastUpdated) / 1000);
        lastUpdatedEl.textContent = `Updated ${ago}s ago`;
      }
    });
  }
});

// --- Blast Radius Button ---
document.getElementById("blastRadiusBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:5174/" });
});
