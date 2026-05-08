// CSS imports
import '../styles/styles.css';

import App from './pages/app';

// Pindahkan event listener online/offline ke fungsi terpisah
// karena registrasi SW sudah ditangani otomatis oleh vite-plugin-pwa
function setupNetworkListeners() {
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
}

document.addEventListener('DOMContentLoaded', async () => {
  // Panggil network listeners
  setupNetworkListeners();

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
