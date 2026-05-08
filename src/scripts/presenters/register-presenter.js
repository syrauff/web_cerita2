import RegisterView from '../views/register-view';
import { register } from '../models/api';

export default class RegisterPresenter {
  #view = null;

  constructor() {
    this.#view = new RegisterView();
  }

  async render() {
    return this.#view.render();
  }

  async afterRender() {
    const form = document.querySelector('#register-form');
    form.addEventListener('submit', (e) => this.#handleSubmit(e));
  }

  async #handleSubmit(e) {
    e.preventDefault();

    // Reset error messages
    document.querySelector('#name-error').textContent = '';
    document.querySelector('#email-error').textContent = '';
    document.querySelector('#password-error').textContent = '';
    document.querySelector('#confirm-error').textContent = '';
    document.querySelector('#error-alert').textContent = '';
    document.querySelector('#error-alert').style.display = 'none';

    const name = document.querySelector('#register-name').value.trim();
    const email = document.querySelector('#register-email').value.trim();
    const password = document.querySelector('#register-password').value;
    const confirm = document.querySelector('#register-confirm').value;

    // Validasi
    if (!name) {
      document.querySelector('#name-error').textContent = 'Nama wajib diisi';
      return;
    }

    if (!email) {
      document.querySelector('#email-error').textContent = 'Email wajib diisi';
      return;
    }

    if (!password) {
      document.querySelector('#password-error').textContent = 'Password wajib diisi';
      return;
    }

    if (password.length < 8) {
      document.querySelector('#password-error').textContent = 'Password minimal 8 karakter';
      return;
    }

    if (password !== confirm) {
      document.querySelector('#confirm-error').textContent = 'Password tidak cocok';
      return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sedang mendaftar...';
    submitBtn.disabled = true;

    try {
      const result = await register(name, email, password);

      // Show success message
      const successMsg = document.querySelector('#success-message');
      successMsg.textContent = 'Registrasi berhasil! Silakan login.';
      successMsg.style.display = 'block';

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 2000);
    } catch (error) {
      console.error('Register error:', error);
      const errorAlert = document.querySelector('#error-alert');
      errorAlert.textContent = error.message || 'Gagal mendaftar. Email mungkin sudah terdaftar.';
      errorAlert.style.display = 'block';

      // Reset button state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }
}
