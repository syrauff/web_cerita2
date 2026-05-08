export default class HomeView {
  render() {
    return `
      <section class="container home-page">
        <div class="hero">
          <h1>Selamat Datang di Aplikasi Cerita</h1>
          <p>Bagikan dan jelajahi cerita-cerita menarik dari seluruh dunia</p>
          <a href="#/stories" class="btn-primary">Lihat Cerita</a>
        </div>
        <div class="features">
          <h2 class="sr-only">Fitur Aplikasi</h2>
          <div class="feature-card">
            <h3>📍 Peta Interaktif</h3>
            <p>Lihat lokasi setiap cerita di peta digital dan jelajahi cerita berdasarkan lokasi geografis</p>
          </div>
          <div class="feature-card">
            <h3>📱 Mudah Digunakan</h3>
            <p>Antarmuka yang responsif dan intuitif untuk pengalaman terbaik di semua perangkat</p>
          </div>
          <div class="feature-card">
            <h3>🔒 Aman</h3>
            <p>Akun Anda aman dengan sistem autentikasi yang terpercaya</p>
          </div>
        </div>
      </section>
    `;
  }
}
