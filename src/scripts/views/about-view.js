export default class AboutView {
  render() {
    return `
      <section class="container about-page">
        <h1>Tentang Aplikasi</h1>
        <div class="about-content">
          <p>
            Aplikasi Cerita adalah platform untuk berbagi dan menjelajahi cerita-cerita menarik dari seluruh dunia.
            Dengan fitur peta interaktif, pengguna dapat melihat lokasi setiap cerita dan mengeksplorasi cerita
            berdasarkan lokasi geografis mereka.
          </p>
          
          <h2>Fitur Utama</h2>
          <ul>
            <li>Melihat cerita-cerita dari pengguna lain</li>
            <li>Visualisasi lokasi cerita pada peta interaktif</li>
            <li>Membuat akun dan login dengan aman</li>
            <li>Menambahkan cerita baru dengan foto dan lokasi</li>
            <li>Responsif di semua perangkat (mobile, tablet, desktop)</li>
          </ul>

          <h2>Teknologi yang Digunakan</h2>
          <ul>
            <li>JavaScript (ES6+)</li>
            <li>Vite (Build Tool)</li>
            <li>Leaflet (Map Library)</li>
            <li>Fetch API (HTTP Requests)</li>
            <li>HTML5 & CSS3</li>
          </ul>
        </div>
      </section>
    `;
  }
}
