const SERVER_URL = 'http://localhost:3000/coverage';
const POLL_INTERVAL_MINUTES = 1;

chrome.runtime.onInstalled.addListener(() => {
  console.log("Coverage Lens installed");
  chrome.alarms.create('poll-coverage', { periodInMinutes: POLL_INTERVAL_MINUTES });
  fetchCoverageData();
});

// Also fetch on startup
fetchCoverageData();

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'poll-coverage') {
    fetchCoverageData();
  }
});

async function fetchCoverageData() {
  try {
    const response = await fetch(SERVER_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    await chrome.storage.local.set({ coverageData: data, lastUpdated: Date.now() });
    
    console.log('Fetched and stored coverage data:', data);
  } catch (error) {
    console.error('Failed to fetch coverage data:', error);
  }
}
