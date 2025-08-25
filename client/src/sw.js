/* eslint-env serviceworker */
import {clientsClaim} from 'workbox-core';
import {precacheAndRoute} from 'workbox-precaching';
import {registerRoute} from 'workbox-routing';
import {CacheFirst} from 'workbox-strategies';

self.skipWaiting();
clientsClaim();

// Precache assets generated during build
precacheAndRoute(self.__WB_MANIFEST);

// Cache only same-origin requests that are not API calls
registerRoute(
  ({url}) => url.origin === self.location.origin && !url.pathname.startsWith('/api/'),
  new CacheFirst()
);
