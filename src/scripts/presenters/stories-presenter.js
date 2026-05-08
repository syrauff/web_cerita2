import StoriesView from '../views/stories-view';
import { getStories, isAuthenticated } from '../models/api';
import { saveFavorite, deleteFavorite, isFavorite } from '../models/db';

export default class StoriesPresenter {
  #view = null;
  #stories = [];

  constructor() {
    this.#view = new StoriesView();
  }

  async render() {
    this.#stories = await getStories(1, 20, 1);
    return this.#view.render(this.#stories, isAuthenticated());
  }

  async afterRender() {
    this.#view.afterRender(this.#stories);
    await this.#setupFavoriteButtons();
  }

  async #setupFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.btn-favorite');
    for (const btn of favoriteButtons) {
      const storyId = btn.dataset.id;
      const alreadySaved = await isFavorite(storyId);
      this.#updateFavoriteButton(btn, alreadySaved);

      btn.addEventListener('click', async (e) => {
        e.stopPropagation(); // prevent story item click
        const id = e.currentTarget.dataset.id;
        const story = this.#stories.find((s) => s.id === id);
        if (!story) return;

        btn.disabled = true;
        try {
          const saved = await isFavorite(id);
          if (saved) {
            await deleteFavorite(id);
            this.#updateFavoriteButton(btn, false);
            this.#showToast('Cerita dihapus dari favorit');
          } else {
            await saveFavorite(story);
            this.#updateFavoriteButton(btn, true);
            this.#showToast('✅ Cerita disimpan ke favorit!');
          }
        } catch (err) {
          console.error('Error toggling favorite:', err);
        } finally {
          btn.disabled = false;
        }
      });
    }
  }

  #updateFavoriteButton(btn, isSaved) {
    btn.textContent = isSaved ? '❤️' : '🤍';
    btn.setAttribute('aria-label', isSaved ? 'Hapus dari favorit' : 'Simpan ke favorit');
    btn.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
    btn.classList.toggle('saved', isSaved);
  }

  #showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'app-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}
