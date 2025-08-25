/* eslint-env serviceworker */
import {clientsClaim} from 'workbox-core';
import {precacheAndRoute} from 'workbox-precaching';
import {registerRoute} from 'workbox-routing';
import {CacheFirst} from 'workbox-strategies';

self.skipWaiting();
clientsClaim();

// Precache assets generated during build
precacheAndRoute(self.__WB_MANIFEST);

// Cache only public static assets
registerRoute(
  ({url, request}) =>
    url.origin === self.location.origin &&
    ['style', 'script', 'image', 'font'].includes(request.destination),
  new CacheFirst()
);
