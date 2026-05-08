import AddStoryView from '../views/add-story-view';
import { addStory, isAuthenticated } from '../models/api';
import { savePendingStory } from '../models/db';

export default class AddStoryPresenter {
  #view = null;
  #selectedLat = null;
  #selectedLon = null;
  #map = null;
  #marker = null;
  #photoBlob = null;
  #photoBase64 = null; // for offline storage
  #stream = null;

  constructor() {
    this.#view = new AddStoryView();
  }

  async render() {
    return this.#view.render(isAuthenticated());
  }

  async afterRender() {
    if (!isAuthenticated()) return;

    this.#setupDescriptionCounter();
    this.#setupPhotoMethods();
    this.#setupFormSubmission();
    this.#loadLeaflet();
    this.#showOfflineWarningIfNeeded();
  }

  #showOfflineWarningIfNeeded() {
    if (!navigator.onLine) {
      const successMsg = document.querySelector('#success-message');
      if (successMsg) {
        successMsg.textContent =
          '⚠️ Anda sedang offline. Cerita akan disimpan lokal dan dikirim otomatis saat online kembali.';
        successMsg.style.display = 'block';
        successMsg.style.backgroundColor = '#fff3e0';
        successMsg.style.color = '#e65100';
        successMsg.style.borderLeftColor = '#ff9800';
      }
    }
  }

  #setupDescriptionCounter() {
    const textarea = document.querySelector('#story-description');
    const charCount = document.querySelector('#char-count');

    if (!textarea) return;

    textarea.addEventListener('input', () => {
      charCount.textContent = textarea.value.length;
    });
  }

  #setupPhotoMethods() {
    const btnUploadMode = document.querySelector('#btn-upload-mode');
    const btnCameraMode = document.querySelector('#btn-camera-mode');
    const uploadContainer = document.querySelector('#upload-container');
    const cameraContainer = document.querySelector('#camera-container');
    const preview = document.querySelector('#photo-preview');
    const fileInput = document.querySelector('#story-photo');

    // Camera elements
    const video = document.querySelector('#camera-stream');
    const canvas = document.querySelector('#camera-canvas');
    const btnStartCamera = document.querySelector('#btn-start-camera');
    const btnCapturePhoto = document.querySelector('#btn-capture-photo');
    const btnStopCamera = document.querySelector('#btn-stop-camera');

    // Mode Toggle
    btnUploadMode.addEventListener('click', () => {
      btnUploadMode.className = 'btn-primary';
      btnCameraMode.className = 'btn-cancel';
      uploadContainer.style.display = 'block';
      cameraContainer.style.display = 'none';
      this.#stopCameraStream(video, btnStartCamera, btnCapturePhoto, btnStopCamera);
    });

    btnCameraMode.addEventListener('click', () => {
      btnCameraMode.className = 'btn-primary';
      btnUploadMode.className = 'btn-cancel';
      cameraContainer.style.display = 'block';
      uploadContainer.style.display = 'none';
    });

    // File Upload logic
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        this.#photoBlob = file;
        const reader = new FileReader();
        reader.onload = (event) => {
          this.#photoBase64 = event.target.result;
          preview.src = event.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });

    // Camera WebRTC logic
    btnStartCamera.addEventListener('click', async () => {
      try {
        this.#stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = this.#stream;
        video.style.display = 'block';
        btnStartCamera.style.display = 'none';
        btnCapturePhoto.style.display = 'block';
        btnStopCamera.style.display = 'block';
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Gagal mengakses kamera. Pastikan perangkat memiliki kamera dan izin diberikan.");
      }
    });

    btnCapturePhoto.addEventListener('click', () => {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      this.#photoBase64 = dataUrl;
      preview.src = dataUrl;
      preview.style.display = 'block';

      // Convert to blob for form submission
      canvas.toBlob((blob) => {
        this.#photoBlob = blob;
      }, 'image/jpeg');

      this.#stopCameraStream(video, btnStartCamera, btnCapturePhoto, btnStopCamera);
    });

    btnStopCamera.addEventListener('click', () => {
      this.#stopCameraStream(video, btnStartCamera, btnCapturePhoto, btnStopCamera);
    });
  }

  #stopCameraStream(video, btnStartCamera, btnCapturePhoto, btnStopCamera) {
    if (this.#stream) {
      this.#stream.getTracks().forEach(track => track.stop());
      this.#stream = null;
    }
    video.style.display = 'none';
    btnStartCamera.style.display = 'block';
    btnCapturePhoto.style.display = 'none';
    btnStopCamera.style.display = 'none';
  }

  #setupFormSubmission() {
    const form = document.querySelector('#add-story-form');
    if (!form) return;

    form.addEventListener('submit', (e) => this.#handleSubmit(e));
  }

  #loadLeaflet() {
    if (window.L) {
      this.#initializeAddStoryMap();
    } else {
      const leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(leafletCSS);

      const leafletJS = document.createElement('script');
      leafletJS.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      leafletJS.onload = () => this.#initializeAddStoryMap();
      document.head.appendChild(leafletJS);
    }
  }

  #initializeAddStoryMap() {
    const mapContainer = document.querySelector('#add-story-map');
    if (!mapContainer) return;

    this.#map = window.L.map('add-story-map').setView([-2.5489, 113.2381], 4);

    const osmLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });
    const esriLayer = window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 19
    });

    osmLayer.addTo(this.#map);
    window.L.control.layers({
      "OpenStreetMap": osmLayer,
      "Esri Satellite": esriLayer
    }).addTo(this.#map);

    this.#map.on('click', (e) => {
      this.#selectedLat = e.latlng.lat;
      this.#selectedLon = e.latlng.lng;

      document.querySelector('#display-lat').textContent = this.#selectedLat.toFixed(4);
      document.querySelector('#display-lon').textContent = this.#selectedLon.toFixed(4);

      if (this.#marker) {
        this.#map.removeLayer(this.#marker);
      }

      this.#marker = window.L.marker([this.#selectedLat, this.#selectedLon]).addTo(this.#map);
    });
  }

  async #handleSubmit(e) {
    e.preventDefault();

    document.querySelectorAll('.error-message').forEach((el) => {
      el.textContent = '';
    });
    document.querySelector('#error-alert').textContent = '';
    document.querySelector('#error-alert').style.display = 'none';

    const description = document.querySelector('#story-description').value.trim();
    
    let isValid = true;

    if (!description) {
      document.querySelector('#description-error').textContent = 'Deskripsi wajib diisi';
      isValid = false;
    }

    if (!this.#photoBlob) {
      document.querySelector('#photo-error').textContent = 'Foto wajib diunggah (pilih dari file atau kamera)';
      isValid = false;
    } else if (this.#photoBlob.size > 1024 * 1024) {
      document.querySelector('#photo-error').textContent = 'Ukuran file maksimal 1MB';
      isValid = false;
    }

    if (!isValid) return;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Mengirim...';
    submitBtn.disabled = true;

    // ── Offline mode: save to IndexedDB ──────────────────────────────────────
    if (!navigator.onLine) {
      try {
        await savePendingStory({
          description,
          photoBase64: this.#photoBase64,
          lat: this.#selectedLat,
          lon: this.#selectedLon,
        });

        const successMsg = document.querySelector('#success-message');
        successMsg.textContent =
          '📤 Cerita disimpan offline! Akan dikirim otomatis saat koneksi kembali. Lihat di halaman Favorit.';
        successMsg.style.display = 'block';
        successMsg.style.backgroundColor = '#fff3e0';
        successMsg.style.color = '#e65100';
        successMsg.style.borderLeftColor = '#ff9800';

        submitBtn.textContent = 'Tersimpan Offline';
        submitBtn.disabled = true;
      } catch (err) {
        console.error('Error saving pending story:', err);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
      return;
    }

    // ── Online mode: send to API ──────────────────────────────────────────────
    try {
      await addStory(description, this.#photoBlob, this.#selectedLat, this.#selectedLon);

      const successMsg = document.querySelector('#success-message');
      successMsg.textContent = 'Cerita berhasil ditambahkan! Anda akan dialihkan...';
      successMsg.style.display = 'block';

      setTimeout(() => {
        window.location.hash = '#/stories';
      }, 2000);
    } catch (error) {
      console.error('Error adding story:', error);
      const errorAlert = document.querySelector('#error-alert');
      errorAlert.textContent = error.message || 'Gagal menambahkan cerita. Silakan coba lagi.';
      errorAlert.style.display = 'block';

      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }
}
