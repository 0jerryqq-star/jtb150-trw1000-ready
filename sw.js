// 備拉片螺桿：離線快取。改版時把版本號加 1，手機下次開啟就會更新。
const VERSION = 'bolt-v33';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // 只管 App 自己的檔案；下載圖檔（其他網站或 /gdrive/）直接走網路
  if (e.request.method !== 'GET' || url.origin !== location.origin || (url.pathname.startsWith('/gdrive/') || url.pathname.startsWith('/gdocs/'))) return;
  // 先用網路拿最新版，沒網路時用快取
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
