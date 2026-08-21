import { login } from "../auth.js";
import { authenticated } from "../auth.js";

export function renderLogin(container) {
  if (authenticated()) {
    window.location.hash = "#/chat";
    return;
  }

  container.innerHTML = `
    <main class="auth-page">

      <section class="auth-container">

        <div class="auth-logo">
          <div class="auth-logo-icon">🦁</div>

          <h1 class="auth-logo-title">
            SalonePadi AI
          </h1>
        </div>

        <div class="auth-card">

          <h2>Welcome back</h2>

          <p class="auth-description">
            Log in to continue using SalonePadi AI.
          </p>

          <form
            id="loginForm"
            class="auth-form"
          >

            <div class="auth-field">
              <label for="loginEmail">
                Email
              </label>

              <input
                id="loginEmail"
                type="email"
                name="email"
                placeholder="Enter your email"
                autocomplete="email"
                required
              >
            </div>

            <div class="auth-field">
              <label for="loginPassword">
                Password
              </label>

              <input
                id="loginPassword"
                type="password"
                name="password"
                placeholder="Enter your password"
                autocomplete="current-password"
                required
              >
            </div>

            <button
              id="loginSubmit"
              class="auth-submit"
              type="submit"
            >
              Log In
            </button>

          </form>

          <div
            id="loginMessage"
            aria-live="polite"
          ></div>

          <div class="auth-link">
            Don't have an account?

            <button
              id="goSignup"
              type="button"
            >
              Create Account
            </button>
          </div>

          <div class="auth-link">
            <button
              id="goHome"
              type="button"
            >
              ← Back to Home
            </button>
          </div>

        </div>

      </section>

    </main>
  `;

  const form =
    document.getElementById("loginForm");

  const submitButton =
    document.getElementById("loginSubmit");

  const message =
    document.getElementById("loginMessage");

  const signupButton =
    document.getElementById("goSignup");

  const homeButton =
    document.getElementById("goHome");

  signupButton.addEventListener("click", () => {
    window.location.hash = "#/signup";
  });

  homeButton.addEventListener("click", () => {
    window.location.hash = "#/";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email =
      document
        .getElementById("loginEmail")
        .value
        .trim();

    const password =
      document
        .getElementById("loginPassword")
        .value;

    message.className = "";
    message.textContent = "";

    submitButton.disabled = true;
    submitButton.textContent = "Logging in...";

    try {
      await login(email, password);

      window.location.hash = "#/chat";

    } catch (error) {
      message.className =
        "auth-message auth-error";

      message.textContent =
        error.message ||
        "Unable to log in.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Log In";
    }
  });
}
