const CACHE_NAME = 'nova-app-v1';

const APP_SHELL = [
    './',
    './index.html',
    './manifest.webmanifest',
    './css/style.css',
    './js/main.js',
    './js/state.js',
    './js/constants.js',
    './js/default-drills.js',
    './js/ui.js',
    './js/editor.js',
    './js/runner.js',
    './js/bluetooth.js',
    './js/cloud.js',
    './js/utils.js',
    './icons/snvttc-pongbot-192x192.png',
    './icons/snvttc-pongbot-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key.startsWith('nova-app-') && key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== 'GET' || url.origin !== self.location.origin) return;

    event.respondWith(
        fetch(request)
            .then(response => {
                if (response.ok) {
                    const cachedResponse = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, cachedResponse));
                }
                return response;
            })
            .catch(async () => {
                const cached = await caches.match(request);
                if (cached) return cached;
                if (request.mode === 'navigate') return caches.match('./index.html');
                return Response.error();
            })
    );
});
