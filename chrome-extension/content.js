(() => {
  const path = window.location.pathname + window.location.search;
  const meta = document.querySelector('meta[name="generator"]');
  const generator = meta ? meta.content : null;

  const signals = {
    url: window.location.href,
    origin: window.location.origin,
    generator,
    hasServiceWorker: 'serviceWorker' in navigator,
    documentCharset: document.characterSet,
    doctype: document.doctype ? document.doctype.name : null,
  };

  chrome.runtime.sendMessage({ type: 'PAGE_SIGNALS', data: signals });
})();
