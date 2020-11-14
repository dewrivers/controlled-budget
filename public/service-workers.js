let filesToCache = [
    '/',
    '/db.js',
    '/index.html',
    '/index.js',
    '/manifest.webmanifest',
    '/service-workers.js',
    '/style.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

let CACHE_NAME = 'static-cache-v2';
let DATA_CACHE_NAME = 'data-cache-v1';

// Install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>{
            console.log('Files successfully Cache!!');
            return cache.addAll(filesToCache);
        })
    )
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                if(key !== DATA_CACHE_NAME && key !== CACHE_NAME)
                    {
                        console.log('Old cache removed', key);
                        return caches.delete(key);
                    }
                })
            )
        })
    )
    self.clients.claim();
});

// fetch
self.addEventListener('fetch', (event) => {
    // cache successful requests to the API
    if(event.request.url.includes('/api/')){
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache =>
            {
            return fetch(event.request)
            .then(response => {
                // If the response was good, clone it and store it in the cache.
                if(response.status === 200){
                    cache.put(event.request.url, response.clone());
                }
                return response;
            })
            .catch(error => {
                // Network request failed, try to get it from the cache.
             return cache.match(event.request);
            });

        }).catch(error => console.log(error))
        );
    return;
}
// if the request is not for the API, serve static assets using "offline-first" approach.
event.respondWith(
 caches.open(CACHE_NAME).then(cache => {
     return cache.match(event.request).then(response => { 
         return response || fetch(event.request);
        })
    })
  )
});

