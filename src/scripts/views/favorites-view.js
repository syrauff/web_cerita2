export default class FavoritesView {
  render() {
    return `
      <section class="favorites-page">
        <div class="container">
          <h1>Cerita Favorit Saya</h1>
          <p class="favorites-subtitle">Cerita yang telah Anda simpan akan muncul di sini.</p>

          <div class="favorites-controls">
            <div class="search-wrapper">
            <label for="favorites-search" class="sr-only">Cari cerita favorit</label>
              <input
                type="search"
                id="favorites-search"
                class="favorites-search"
                placeholder="Cari di favorit..."
                aria-label="Cari cerita favorit"
              />
              <span class="search-icon" aria-hidden="true">🔍</span>
            </div>

            <div class="sort-wrapper">
              <label for="favorites-sort" class="sr-only">Urutkan berdasarkan</label>
              <select id="favorites-sort" class="favorites-sort" aria-label="Urutkan cerita favorit">
                <option value="newest">Terbaru Disimpan</option>
                <option value="oldest">Terlama Disimpan</option>
                <option value="name-asc">Nama (A–Z)</option>
                <option value="name-desc">Nama (Z–A)</option>
              </select>
            </div>
          </div>

          <div id="favorites-count" class="favorites-count" aria-live="polite"></div>

          <div id="favorites-list" class="favorites-list" role="region" aria-label="Daftar cerita favorit">
            <div class="loading-spinner" aria-label="Memuat cerita favorit...">
              <div class="spinner"></div>
              <p>Memuat favorit...</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  renderStories(stories, query = '') {
    const listEl = document.querySelector('#favorites-list');
    const countEl = document.querySelector('#favorites-count');
    if (!listEl) return;

    if (stories.length === 0) {
      const emptyMessage = query
        ? `Tidak ada cerita favorit yang cocok dengan "<strong>${query}</strong>".`
        : 'Belum ada cerita favorit. Kunjungi <a href="#/stories">halaman cerita</a> dan simpan cerita yang Anda sukai!';

      listEl.innerHTML = `<p class="no-stories">${emptyMessage}</p>`;
      if (countEl) countEl.textContent = '';
      return;
    }

    if (countEl) {
      countEl.textContent = `Menampilkan ${stories.length} cerita${query ? ` untuk "${query}"` : ''}`;
    }

    listEl.innerHTML = stories
      .map(
        (story) => `
        <article class="story-item favorite-item" data-id="${story.id}" aria-label="Cerita favorit oleh ${story.name}">
          <img
            src="${story.photoUrl}"
            alt="Foto cerita oleh ${story.name}"
            class="story-image"
            loading="lazy"
          />
          <div class="story-content">
            <h2 class="story-title">${story.name}</h2>
            <p class="story-description">${story.description.substring(0, 120)}${story.description.length > 120 ? '...' : ''}</p>
            <div class="story-meta">
              ${story.lat && story.lon ? `<span class="story-location" aria-label="Lokasi: Lat ${story.lat.toFixed(2)}, Lon ${story.lon.toFixed(2)}">📍 ${story.lat.toFixed(2)}, ${story.lon.toFixed(2)}</span>` : '<span class="no-location">📍 Tanpa lokasi</span>'}
              <span class="story-saved-at" aria-label="Disimpan pada ${new Date(story.savedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}">
                🕐 Disimpan: ${new Date(story.savedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
          <button
            class="btn-delete-favorite"
            data-id="${story.id}"
            aria-label="Hapus ${story.name} dari favorit"
            title="Hapus dari favorit"
          >
            🗑️
          </button>
        </article>
      `
      )
      .join('');
  }

  renderPendingSync(pendingStories) {
    const container = document.querySelector('#favorites-list');
    if (!container || pendingStories.length === 0) return;

    const pendingSection = document.createElement('div');
    pendingSection.className = 'pending-sync-section';
    pendingSection.id = 'pending-sync-section';
    pendingSection.innerHTML = `
      <div class="pending-sync-banner" role="status" aria-live="polite">
        <div class="pending-sync-header">
          <span class="pending-icon">📤</span>
          <h2 class="pending-title">Cerita Offline (${pendingStories.length})</h2>
          <button id="btn-sync-now" class="btn-sync" aria-label="Sinkronisasi cerita offline sekarang">
            🔄 Sinkronkan Sekarang
          </button>
        </div>
        <p class="pending-desc">Cerita berikut dibuat saat offline dan belum dikirim ke server:</p>
        <ul class="pending-list">
          ${pendingStories
            .map(
              (p) => `
            <li class="pending-item" data-local-id="${p.localId}">
              <span class="pending-desc-text">${p.description.substring(0, 60)}${p.description.length > 60 ? '...' : ''}</span>
              <span class="pending-date">${new Date(p.createdAt).toLocaleDateString('id-ID')}</span>
              <button class="btn-delete-pending" data-local-id="${p.localId}" aria-label="Hapus cerita offline ini" title="Hapus">✕</button>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    `;

    container.prepend(pendingSection);
  }

  showSyncResult(synced, failed) {
    const banner = document.querySelector('#pending-sync-section');
    if (banner) banner.remove();

    const msg = document.createElement('div');
    msg.className = 'sync-result-toast';
    msg.setAttribute('role', 'status');
    msg.setAttribute('aria-live', 'polite');
    msg.textContent =
      failed === 0
        ? `✅ ${synced} cerita berhasil disinkronkan!`
        : `⚠️ ${synced} berhasil, ${failed} gagal.`;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 4000);
  }
}
