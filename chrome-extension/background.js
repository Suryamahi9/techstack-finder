chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ scanHistory: [] });
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
    chrome.action.openPopup();
  }
});
