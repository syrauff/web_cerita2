export default class RegisterView {
  render() {
    return `
      <section class="container auth-page">
        <div class="auth-card">
          <h1>Register</h1>
          <form id="register-form" class="auth-form">
            <div class="form-group">
              <label for="register-name">Nama Lengkap</label>
              <input 
                type="text" 
                id="register-name" 
                name="name" 
                required 
                aria-label="Full name"
                placeholder="Masukkan nama lengkap"
              />
              <span class="error-message" id="name-error"></span>
            </div>

            <div class="form-group">
              <label for="register-email">Email</label>
              <input 
                type="email" 
                id="register-email" 
                name="email" 
                required 
                aria-label="Email address"
                placeholder="Masukkan email"
              />
              <span class="error-message" id="email-error"></span>
            </div>

            <div class="form-group">
              <label for="register-password">Password</label>
              <input 
                type="password" 
                id="register-password" 
                name="password" 
                required 
                aria-label="Password"
                placeholder="Minimal 8 karakter"
              />
              <span class="error-message" id="password-error"></span>
            </div>

            <div class="form-group">
              <label for="register-confirm">Konfirmasi Password</label>
              <input 
                type="password" 
                id="register-confirm" 
                name="confirm" 
                required 
                aria-label="Confirm password"
                placeholder="Ulangi password"
              />
              <span class="error-message" id="confirm-error"></span>
            </div>

            <button type="submit" class="btn-submit">Register</button>
            <div id="error-alert" class="error-alert" role="alert" aria-live="assertive"></div>
            <div id="success-message" class="success-message" role="alert" aria-live="polite"></div>
          </form>

          <p class="auth-link">
            Sudah punya akun? <a href="#/login">Login di sini</a>
          </p>
        </div>
      </section>
    `;
  }
}
