import { api } from "../api.js";

export function renderLogin(container) {
  container.innerHTML = `
    <main class="auth-page">

      <section class="auth-container">

        <div class="auth-logo">🦁</div>

        <h1>Welcome back</h1>

        <p>
          Log in to continue with SalonePadi AI.
        </p>

        <form id="loginForm">

          <input
            id="email"
            type="email"
            placeholder="Email address"
            autocomplete="email"
            required
          />

          <input
            id="password"
            type="password"
            placeholder="Password"
            autocomplete="current-password"
            required
          />

          <button id="loginButton" type="submit">
            Log In
          </button>

        </form>

        <p id="loginMessage"></p>

        <button
          id="signupLink"
          class="auth-link"
          type="button"
        >
          Don't have an account? Create one
        </button>

      </section>

    </main>
  `;

  const form =
    document.getElementById("loginForm");

  const message =
    document.getElementById("loginMessage");

  const button =
    document.getElementById("loginButton");

  document
    .getElementById("signupLink")
    .addEventListener("click", () => {
      window.location.hash = "#/signup";
    });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email =
      document.getElementById("email").value.trim();

    const password =
      document.getElementById("password").value;

    button.disabled = true;
    button.textContent = "Logging in...";
    message.textContent = "";

    try {
      const data = await api.post(
        "/api/auth/login",
        {
          email,
          password
        }
      );

      if (data.session?.access_token) {
        localStorage.setItem(
          "salonepadi_access_token",
          data.session.access_token
        );
      }

      if (data.user) {
        localStorage.setItem(
          "salonepadi_user",
          JSON.stringify(data.user)
        );
      }

      window.location.hash = "#/chat";

    } catch (error) {
      message.textContent =
        error.message ||
        "Unable to log in.";

      button.disabled = false;
      button.textContent = "Log In";
    }
  });
}
