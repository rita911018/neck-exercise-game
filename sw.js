const CACHE_NAME = 'game-cache-v1';

const PRECACHE_URLS = [
  'libs/tf-core.min.js',
  'libs/tf-converter.min.js',
  'libs/tf-backend-webgl.min.js',
  'libs/pose-detection.min.js',
  'models/model.json',
  'models/group1-shard1of2.bin',
  'models/group1-shard2of2.bin'
];

// 安装：预缓存静态资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
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

  // libs/ 和 models/ 用 cache-first
  if (url.pathname.includes('/libs/') || url.pathname.includes('/models/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
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
