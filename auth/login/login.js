// JOHNNY TEC OS — auth/login/login.js

if (AuthService.isAuthenticated()) {
  window.location.href = '../../index.html';
}

const form = document.getElementById('login-form');
const errorBox = document.getElementById('form-error');
const submitBtn = document.getElementById('submit-btn');

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.add('is-visible');
}

function clearError() {
  errorBox.textContent = '';
  errorBox.classList.remove('is-visible');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  try {
    await AuthService.login(email, password);
    window.location.href = '../../index.html';
  } catch (err) {
    showError(err.message || 'Unable to log in.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Log in';
  }
});
