export default class StoriesView {
  render(stories, isAuthenticated) {
    return `
      <section class="stories-page">
        <div class="container">
          <h1>Cerita-Cerita Menarik</h1>
          
          <div class="stories-container">
            <aside class="stories-map">
              <h2 class="sr-only">Peta Cerita</h2>
              <div id="map" class="map-container" role="region" aria-label="Peta dengan lokasi cerita"></div>
            </aside>
            
            <section class="stories-list">
              <h2>Daftar Cerita</h2>
              ${
                stories.length > 0
                  ? `<div class="stories-items" role="region" aria-label="Daftar cerita yang dapat dipilih">
                      ${stories
                        .map(
                          (story, index) => `
                        <article class="story-item" data-index="${index}" data-id="${story.id}" role="button" tabindex="0" aria-label="Cerita oleh ${story.name}: ${story.description.substring(0, 50)}...">
                          <img 
                            src="${story.photoUrl}" 
                            alt="Foto cerita oleh ${story.name}"
                            class="story-image"
                            loading="lazy"
                          />
                          <div class="story-content">
                            <h3>${story.name}</h3>
                            <p class="story-description">${story.description.substring(0, 100)}...</p>
                            <div class="story-meta">
                              ${story.lat && story.lon ? `
                                <span aria-label="Latitude: ${story.lat.toFixed(2)}">Lat: ${story.lat.toFixed(2)}</span>
                                <span aria-label="Longitude: ${story.lon.toFixed(2)}">Lon: ${story.lon.toFixed(2)}</span>
                              ` : `<span class="no-location">Tanpa lokasi</span>`}
                            </div>
                          </div>
                          <button
                            class="btn-favorite"
                            data-id="${story.id}"
                            aria-label="Simpan ke favorit"
                            aria-pressed="false"
                            title="Simpan ke favorit"
                          >🤍</button>
                        </article>
                      `
                        )
                        .join('')}
                    </div>`
                  : `<p class="no-stories">Tidak ada cerita untuk ditampilkan. ${!isAuthenticated ? 'Silakan <a href="#/login">login</a> untuk melihat cerita.' : ''}</p>`
              }
            </section>
          </div>
        </div>
      </section>
    `;
  }

  afterRender(stories) {
    this.#loadLeaflet(stories);
    this.#setupKeyboardNavigation();
  }

  #setupKeyboardNavigation() {
    const storyItems = document.querySelectorAll('.story-item');
    storyItems.forEach((item) => {
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.click();
        }
      });
    });
  }

  #loadLeaflet(stories) {
    if (window.L) {
      this.#initializeMap(stories);
    } else {
      const leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(leafletCSS);

      const leafletJS = document.createElement('script');
      leafletJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      leafletJS.onload = () => this.#initializeMap(stories);
      document.head.appendChild(leafletJS);
    }
  }

  #initializeMap(stories) {
    const mapContainer = document.querySelector('#map');
    if (!mapContainer) return;

    const map = window.L.map('map').setView([-2.5489, 113.2381], 4);

    const osmLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    });

    const esriLayer = window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 19
    });

    const baseMaps = {
      "OpenStreetMap": osmLayer,
      "Esri Satellite": esriLayer
    };

    osmLayer.addTo(map);
    window.L.control.layers(baseMaps).addTo(map);

    stories.forEach((story, index) => {
      if (story.lat && story.lon) {
        const marker = window.L.marker([story.lat, story.lon]).addTo(map);

        marker.bindPopup(`
          <div class="popup-content">
            <img 
              src="${story.photoUrl}" 
              alt="Foto cerita oleh ${story.name}"
              style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;"
            />
            <h4>${story.name}</h4>
            <p>${story.description.substring(0, 100)}...</p>
          </div>
        `);

        const storyItem = document.querySelector(`.story-item[data-index="${index}"]`);
        if (storyItem) {
          storyItem.addEventListener('click', () => {
            marker.openPopup();
            map.setView([story.lat, story.lon], 12);
            storyItem.classList.add('active');
            storyItem.setAttribute('aria-selected', 'true');

            document.querySelectorAll('.story-item').forEach((item) => {
              if (item !== storyItem) {
                item.classList.remove('active');
                item.setAttribute('aria-selected', 'false');
              }
            });
          });
        }
      }
    });
  }
}
