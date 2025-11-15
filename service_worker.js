const CACHE_NAME = 'golf-calculator-v1';

// 현재 경로를 기준으로 상대 경로 설정
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './cd5cc840-4fba-47c4-b991-226ea22f2891.png',
  './image (2).png'
];

// 설치 단계: 필요한 리소스 캐시
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시 열림');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('캐시 실패:', err);
      })
  );
  // 즉시 활성화
  self.skipWaiting();
});

// 활성화 단계: 오래된 캐시 정리
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('오래된 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 즉시 제어 시작
  return self.clients.claim();
});

// Fetch 단계: 네트워크 우선, 실패 시 캐시 사용
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 유효한 응답인 경우 캐시에 저장
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 반환
        return caches.match(event.request);
      })
  );
});
