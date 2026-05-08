import FavoritesView from '../views/favorites-view';
import {
  getFavorites,
  deleteFavorite,
  getPendingStories,
  deletePendingStory,
} from '../models/db';
import { addStory } from '../models/api';

export default class FavoritesPresenter {
  #view = null;
  #allFavorites = [];
  #currentQuery = '';
  #currentSort = 'newest';

  constructor() {
    this.#view = new FavoritesView();
  }

  async render() {
    return this.#view.render();
  }

  async afterRender() {
    await this.#loadFavorites();
    await this.#loadPendingSync();
    this.#setupSearch();
    this.#setupSort();
  }

  // ── Load & Render ──────────────────────────────────────────────────────────

  async #loadFavorites() {
    try {
      this.#allFavorites = await getFavorites();
      this.#renderFiltered();
      this.#setupDeleteButtons();
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }

  #renderFiltered() {
    let filtered = [...this.#allFavorites];

    // Filter by search query
    if (this.#currentQuery) {
      const q = this.#currentQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.#currentSort) {
        case 'oldest':
          return new Date(a.savedAt) - new Date(b.savedAt);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default: // newest
          return new Date(b.savedAt) - new Date(a.savedAt);
      }
    });

    this.#view.renderStories(filtered, this.#currentQuery);
    this.#setupDeleteButtons();
  }

  // ── Search ─────────────────────────────────────────────────────────────────

  #setupSearch() {
    const searchInput = document.querySelector('#favorites-search');
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.#currentQuery = e.target.value.trim();
        this.#renderFiltered();
      }, 300);
    });
  }

  // ── Sort ───────────────────────────────────────────────────────────────────

  #setupSort() {
    const sortSelect = document.querySelector('#favorites-sort');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', (e) => {
      this.#currentSort = e.target.value;
      this.#renderFiltered();
    });
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  #setupDeleteButtons() {
    document.querySelectorAll('.btn-delete-favorite').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if (!id) return;

        const article = e.currentTarget.closest('.favorite-item');
        if (article) {
          article.style.opacity = '0.5';
          article.style.pointerEvents = 'none';
        }

        try {
          await deleteFavorite(id);
          this.#allFavorites = this.#allFavorites.filter((s) => s.id !== id);
          this.#renderFiltered();
        } catch (error) {
          console.error('Error deleting favorite:', error);
          if (article) {
            article.style.opacity = '1';
            article.style.pointerEvents = 'auto';
          }
        }
      });
    });
  }

  // ── Pending Stories (Offline Sync) ─────────────────────────────────────────

  async #loadPendingSync() {
    try {
      const pending = await getPendingStories();
      if (pending.length > 0) {
        this.#view.renderPendingSync(pending);
        this.#setupPendingActions(pending);
      }
    } catch (error) {
      console.error('Error loading pending stories:', error);
    }
  }

  #setupPendingActions(pendingStories) {
    // Sync now button
    const syncBtn = document.querySelector('#btn-sync-now');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => this.#syncPendingStories());
    }

    // Delete individual pending story
    document.querySelectorAll('.btn-delete-pending').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const localId = Number(e.currentTarget.dataset.localId);
        try {
          await deletePendingStory(localId);
          const item = document.querySelector(`.pending-item[data-local-id="${localId}"]`);
          if (item) item.remove();

          const remaining = document.querySelectorAll('.pending-item');
          if (remaining.length === 0) {
            const section = document.querySelector('#pending-sync-section');
            if (section) section.remove();
          }
        } catch (err) {
          console.error('Error deleting pending story:', err);
        }
      });
    });
  }

  async #syncPendingStories() {
    const syncBtn = document.querySelector('#btn-sync-now');
    if (syncBtn) {
      syncBtn.disabled = true;
      syncBtn.textContent = '⏳ Menyinkronkan...';
    }

    let synced = 0;
    let failed = 0;

    try {
      const pending = await getPendingStories();

      for (const story of pending) {
        try {
          // Reconstruct the photo blob from base64 if stored that way
          let photoBlob = story.photoBlob;
          if (story.photoBase64) {
            const res = await fetch(story.photoBase64);
            photoBlob = await res.blob();
          }

          await addStory(story.description, photoBlob, story.lat, story.lon);
          await deletePendingStory(story.localId);
          synced++;
        } catch {
          failed++;
        }
      }

      this.#view.showSyncResult(synced, failed);
    } catch (error) {
      console.error('Sync error:', error);
    }
  }
}
