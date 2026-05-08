// CSS imports
import '../styles/styles.css';

import App from './pages/app';

// Register Service Worker
async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('Service Worker registered:', registration.scope);

      // Listen for online event to prompt pending story sync
      window.addEventListener('online', () => {
        const banner = document.querySelector('#offline-banner');
        if (banner) banner.remove();
        console.log('Back online. Check favorites page to sync pending stories.');
      });

      // Show offline banner when offline
      window.addEventListener('offline', () => {
        if (!document.querySelector('#offline-banner')) {
          const banner = document.createElement('div');
          banner.id = 'offline-banner';
          banner.className = 'offline-banner';
          banner.setAttribute('role', 'status');
          banner.setAttribute('aria-live', 'polite');
          banner.innerHTML = '📡 Mode Offline — Beberapa fitur mungkin terbatas';
          document.body.prepend(banner);
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await registerSW();

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
