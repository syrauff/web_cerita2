export default class AddStoryView {
  render(isAuthenticated) {
    if (!isAuthenticated) {
      return `
        <section class="container add-story-page">
          <div class="auth-required">
            <h1>Silakan Login Terlebih Dahulu</h1>
            <p>Anda perlu login untuk menambahkan cerita baru.</p>
            <a href="#/login" class="btn-primary">Pergi ke Login</a>
          </div>
        </section>
      `;
    }

    return `
      <section class="container add-story-page">
        <h1>Tambah Cerita Baru</h1>
        
        <form id="add-story-form" class="add-story-form" novalidate>
          <div class="form-group full-width">
            <label for="story-description">Deskripsi <span class="required">*</span></label>
            <textarea 
              id="story-description" 
              name="description" 
              placeholder="Ceritakan kisah menarik Anda..."
              rows="6"
              required
              aria-label="Deskripsi cerita"
              aria-required="true"
            ></textarea>
            <span class="error-message" id="description-error"></span>
            <span class="char-count"><span id="char-count">0</span> karakter</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="story-photo">Unggah Foto <span class="required">*</span></label>
              
              <div class="photo-methods" style="display: flex; gap: 10px; margin-bottom: 10px;">
                <button type="button" id="btn-upload-mode" class="btn-primary" style="padding: 8px 16px; flex: 1;">Unggah File</button>
                <button type="button" id="btn-camera-mode" class="btn-cancel" style="padding: 8px 16px; flex: 1;">Kamera Web</button>
              </div>

              <div id="upload-container">
                <div class="file-input-wrapper">
                  <input 
                    type="file" 
                    id="story-photo" 
                    name="photo" 
                    accept="image/*"
                    aria-label="File foto cerita"
                  />
                  <label for="story-photo" class="file-label">Pilih Foto (Max 1MB)</label>
                </div>
              </div>

              <div id="camera-container" style="display: none;">
                <video id="camera-stream" autoplay playsinline style="width: 100%; border-radius: 8px; background: #000; display: none;"></video>
                <button type="button" id="btn-start-camera" class="btn-primary" style="width: 100%; margin-bottom: 10px;">Mulai Kamera</button>
                <button type="button" id="btn-capture-photo" class="btn-primary" style="width: 100%; display: none;">Ambil Foto</button>
                <button type="button" id="btn-stop-camera" class="btn-cancel" style="width: 100%; display: none; margin-top: 10px;">Tutup Kamera</button>
                <canvas id="camera-canvas" style="display: none;"></canvas>
              </div>

              <span class="file-preview">
                <img id="photo-preview" alt="Preview foto cerita" style="display: none; margin-top: 10px; max-width: 100%; border-radius: 8px;" />
              </span>
              <span class="error-message" id="photo-error"></span>
            </div>
          </div>

          <div class="form-group full-width">
            <p class="form-section-label"><strong>Pilih Lokasi di Peta <span class="optional-tag">(Opsional)</span></strong></p>
            <p class="help-text">Klik pada peta untuk menentukan latitude dan longitude cerita Anda</p>
            <div id="add-story-map" class="map-container" role="region" aria-label="Peta untuk memilih lokasi cerita"></div>
            <div class="coordinates-display">
              <p>Latitude: <span id="display-lat">Tidak dipilih</span></p>
              <p>Longitude: <span id="display-lon">Tidak dipilih</span></p>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-submit" aria-label="Kirim cerita baru">Kirim Cerita</button>
            <a href="#/stories" class="btn-cancel">Batal</a>
          </div>

          <div id="success-message" class="success-message" role="alert" aria-live="polite"></div>
          <div id="error-alert" class="error-alert" role="alert" aria-live="assertive"></div>
        </form>
      </section>
    `;
  }
}
