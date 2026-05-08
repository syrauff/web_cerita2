export default class LoginView {
  render() {
    return `
      <section class="container auth-page">
        <div class="auth-card">
          <h1>Login</h1>
          <form id="login-form" class="auth-form">
            <div class="form-group">
              <label for="login-email">Email</label>
              <input 
                type="email" 
                id="login-email" 
                name="email" 
                required 
                aria-label="Email address"
                placeholder="Masukkan email"
              />
              <span class="error-message" id="email-error"></span>
            </div>

            <div class="form-group">
              <label for="login-password">Password</label>
              <input 
                type="password" 
                id="login-password" 
                name="password" 
                required 
                aria-label="Password"
                placeholder="Masukkan password"
              />
              <span class="error-message" id="password-error"></span>
            </div>

            <button type="submit" class="btn-submit">Login</button>
            <div id="error-alert" class="error-alert" role="alert" aria-live="assertive"></div>
            <div id="success-message" class="success-message" role="alert" aria-live="polite"></div>
          </form>

          <p class="auth-link">
            Belum punya akun? <a href="#/register">Daftar di sini</a>
          </p>
        </div>
      </section>
    `;
  }
}
