import LoginView from '../views/login-view';
import { login } from '../models/api';

export default class LoginPresenter {
  #view = null;

  constructor() {
    this.#view = new LoginView();
  }

  async render() {
    return this.#view.render();
  }

  async afterRender() {
    const form = document.querySelector('#login-form');
    form.addEventListener('submit', (e) => this.#handleSubmit(e));
  }

  async #handleSubmit(e) {
    e.preventDefault();

    // Reset error messages
    document.querySelector('#email-error').textContent = '';
    document.querySelector('#password-error').textContent = '';
    document.querySelector('#error-alert').textContent = '';
    document.querySelector('#error-alert').style.display = 'none';

    const email = document.querySelector('#login-email').value.trim();
    const password = document.querySelector('#login-password').value;

    // Validasi
    if (!email) {
      document.querySelector('#email-error').textContent = 'Email wajib diisi';
      return;
    }

    if (!password) {
      document.querySelector('#password-error').textContent = 'Password wajib diisi';
      return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sedang login...';
    submitBtn.disabled = true;

    try {
      const result = await login(email, password);

      // Show success message
      const successMsg = document.querySelector('#success-message');
      successMsg.textContent = `Login berhasil! Selamat datang ${result.loginResult.name}!`;
      successMsg.style.display = 'block';

      // Redirect to home after 2 seconds
      setTimeout(() => {
        window.location.hash = '#/';
      }, 2000);
    } catch (error) {
      console.error('Login error:', error);
      const errorAlert = document.querySelector('#error-alert');
      errorAlert.textContent = error.message || 'Gagal login. Periksa email dan password Anda.';
      errorAlert.style.display = 'block';

      // Reset button state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }
}
