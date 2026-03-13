// Popup logic to open the side panel
document.getElementById('open-sidepanel')?.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId) {
            chrome.sidePanel.open({ tabId });
        }
    });
});

console.log('Popup script loaded');
