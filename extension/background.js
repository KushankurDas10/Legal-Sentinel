chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// Handle "One-Click" audits from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "analyzeLink") {
    // 1. Cache the URL
    chrome.storage.local.set({ pendingUrl: message.url }, () => {
      // 2. Force open the panel
      chrome.sidePanel.open({ tabId: sender.tab.id }).then(() => {
        // 3. Ping the panel just in case it's already open
        chrome.runtime.sendMessage({ action: "startPendingAnalysis", url: message.url });
      });
    });
  }
});
