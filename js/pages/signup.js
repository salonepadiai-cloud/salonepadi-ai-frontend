import { signup } from "../auth.js";
import { authenticated } from "../auth.js";

export function renderSignup(container) {
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

          <h2>Create your account</h2>

          <p class="auth-description">
            Create an account to start using
            your personal AI padi.
          </p>

          <form
            id="signupForm"
            class="auth-form"
          >

            <div class="auth-field">
              <label for="signupName">
                Name
              </label>

              <input
                id="signupName"
                type="text"
                name="name"
                placeholder="Enter your name"
                autocomplete="name"
                required
              >
            </div>

            <div class="auth-field">
              <label for="signupEmail">
                Email
              </label>

              <input
                id="signupEmail"
                type="email"
                name="email"
                placeholder="Enter your email"
                autocomplete="email"
                required
              >
            </div>

            <div class="auth-field">
              <label for="signupPassword">
                Password
              </label>

              <input
                id="signupPassword"
                type="password"
                name="password"
                placeholder="Create a password"
                autocomplete="new-password"
                minlength="6"
                required
              >
            </div>

            <button
              id="signupSubmit"
              class="auth-submit"
              type="submit"
            >
              Create Account
            </button>

          </form>

          <div
            id="signupMessage"
            aria-live="polite"
          ></div>

          <div class="auth-link">
            Already have an account?

            <button
              id="goLogin"
              type="button"
            >
              Log In
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
    document.getElementById("signupForm");

  const submitButton =
    document.getElementById("signupSubmit");

  const message =
    document.getElementById("signupMessage");

  document
    .getElementById("goLogin")
    .addEventListener("click", () => {
      window.location.hash = "#/login";
    });

  document
    .getElementById("goHome")
    .addEventListener("click", () => {
      window.location.hash = "#/";
    });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name =
      document
        .getElementById("signupName")
        .value
        .trim();

    const email =
      document
        .getElementById("signupEmail")
        .value
        .trim();

    const password =
      document
        .getElementById("signupPassword")
        .value;

    message.className = "";
    message.textContent = "";

    submitButton.disabled = true;
    submitButton.textContent =
      "Creating account...";

    try {
      await signup(
        name,
        email,
        password
      );

      window.location.hash = "#/chat";

    } catch (error) {
      message.className =
        "auth-message auth-error";

      message.textContent =
        error.message ||
        "Unable to create account.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent =
        "Create Account";
    }
  });
}
