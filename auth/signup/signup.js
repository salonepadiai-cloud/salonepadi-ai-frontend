// JOHNNY TEC OS — auth/signup/signup.js

if (AuthService.isAuthenticated()) {
  window.location.href = '../../index.html';
}

const form = document.getElementById('signup-form');
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

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';

  try {
    const data = await AuthService.signup(email, password, name);

    if (data.session) {
      // Backend auto-logged us in — go straight to the app.
      window.location.href = '../../index.html';
    } else {
      // Account created but not auto-logged in — send to login.
      window.location.href = '../login/login.html';
    }
  } catch (err) {
    showError(err.message || 'Unable to create account.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign up';
  }
});
