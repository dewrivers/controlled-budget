let CACHE_NAME = 'static-cache-v2';
let DATA_CACHE_NAME = 'data-cache-v1';

let urlsCache = [
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

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>{
            console.log('Successfully Cache!!');
            return cache.addAll(urlsCache);
        })
    )
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

// 

self.addEventListener('fetch', (event) => {
    if(event.request.url.includes('/api/')){
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache =>
            {
            return fetch(event.request)
            .then(response => {
                if(response.status === 200){
                    cache.put(event.request.url, response.clone());
                }
                return response;
            })
            .catch(error => {
             return cache.match(event.request);
            });

        }).catch(error => console.log(error))
        );
    // );
    return;
}
event.respondWith(

)
});

