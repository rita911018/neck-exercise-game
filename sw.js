const CACHE_NAME = 'game-cache-v2';
const CDN = 'cdn.jsdelivr.net';

// 不再预缓存（资源来自 CDN，跨域无法 addAll）
// 改为运行时缓存

// 安装：直接激活
self.addEventListener('install', event => {
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// 请求拦截
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // CDN 资源（libs/ models/）和本地 libs/models 都用 cache-first
  const isCDN = url.hostname === CDN;
  const isAsset = url.pathname.includes('/libs/') || url.pathname.includes('/models/');

  if (isCDN || isAsset) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // HTML 用 network-first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // 其他请求：正常网络请求
  event.respondWith(fetch(event.request));
});
