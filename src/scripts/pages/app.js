import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { isAuthenticated, logout } from '../models/api';
import {
  isPushSubscribed,
  subscribePushNotification,
  unsubscribePushNotification,
} from '../utils/notification-helper';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
    this.#updateNavigation();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      const isOpen = this.#navigationDrawer.classList.toggle('open');
      this.#drawerButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
          this.#drawerButton.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  async #updateNavigation() {
    const navList = document.querySelector('#nav-list');
    if (!navList) return;

    const subscribed = isAuthenticated() ? await isPushSubscribed() : false;
    const notifLabel = subscribed ? '🔔 Notif ON' : '🔕 Notif OFF';
    const notifTitle = subscribed ? 'Matikan push notification' : 'Aktifkan push notification';

    if (isAuthenticated()) {
      navList.innerHTML = `
        <li><a href="#/">Beranda</a></li>
        <li><a href="#/stories">Cerita</a></li>
        <li><a href="#/add-story">Tambah Cerita</a></li>
        <li><a href="#/favorites">Favorit</a></li>
        <li><a href="#/about">Tentang</a></li>
        <li>
          <button
            id="notif-toggle-btn"
            class="btn-notif-toggle ${subscribed ? 'subscribed' : ''}"
            aria-label="${notifTitle}"
            aria-pressed="${subscribed}"
            title="${notifTitle}"
          >${notifLabel}</button>
        </li>
        <li><a href="javascript:void(0)" id="logout-btn">Logout</a></li>
      `;

      // Notification toggle
      const notifBtn = document.querySelector('#notif-toggle-btn');
      if (notifBtn) {
        notifBtn.addEventListener('click', async () => {
          notifBtn.disabled = true;
          try {
            if (subscribed) {
              await unsubscribePushNotification();
              this.#showToast('🔕 Push notification dinonaktifkan');
            } else {
              await subscribePushNotification();
              this.#showToast('🔔 Push notification diaktifkan!');
            }
            await this.#updateNavigation();
          } catch (err) {
            this.#showToast('❌ ' + (err.message || 'Gagal mengubah notifikasi'));
            notifBtn.disabled = false;
          }
        });
      }

      // Logout
      const logoutBtn = document.querySelector('#logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          logout();
          this.#updateNavigation();
          window.location.hash = '#/login';
        });
      }
    } else {
      navList.innerHTML = `
        <li><a href="#/">Beranda</a></li>
        <li><a href="#/stories">Cerita</a></li>
        <li><a href="#/register">Register</a></li>
        <li><a href="#/about">Tentang</a></li>
        <li><a href="#/login">Login</a></li>
      `;
    }
  }

  #showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'app-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  async renderPage() {
    await this.#updateNavigation();
    const url = getActiveRoute();
    const page = routes[url];

    if (!page) {
      this.#content.innerHTML = '<div class="container"><p>Halaman tidak ditemukan</p></div>';
      return;
    }

    if (!document.startViewTransition) {
      await this.#renderContent(page);
      return;
    }

    document.startViewTransition(async () => {
      await this.#renderContent(page);
    });
  }

  async #renderContent(page) {
    this.#content.innerHTML = await page.render();
    if (page.afterRender) {
      await page.afterRender();
    }
    window.scrollTo(0, 0);
  }
}

export default App;
