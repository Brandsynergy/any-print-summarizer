// SERVICE WORKER DISABLED - NO PWA FUNCTIONALITY
// This service worker has been intentionally disabled to prevent PWA install prompts

console.log('Service worker disabled - no PWA functionality');

// Minimal install event - do nothing
self.addEventListener('install', (event) => {
  console.log('Service worker installing (disabled mode)');
  self.skipWaiting();
});

// Minimal activate event - do nothing  
self.addEventListener('activate', (event) => {
  console.log('Service worker activating (disabled mode)');
  self.clients.claim();
});

// No fetch interception - let all requests pass through normally
// No caching, no PWA functionality

console.log('Service worker loaded in disabled mode - no PWA functionality');
