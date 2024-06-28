chrome.runtime.sendMessage({
  action: 'pageLoaded',
  url: window.location.href,
});
