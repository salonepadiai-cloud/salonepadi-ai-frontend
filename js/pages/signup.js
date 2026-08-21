import { api } from "../api.js";

export function renderSignup(container) {
  container.innerHTML = `
    <main class="auth-page">

      <section class="auth-container">

        <div class="auth-logo">🦁</div>

        <h1>Create your account</h1>

        <p>
          Join SalonePadi AI and start building
          your personal AI relationship.
        </p>

        <form id="signupForm">

          <input
            id="name"
            type="text"
            placeholder="Your name"
            autocomplete="name"
            required
          />

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
            autocomplete="new-password"
            minlength="6"
            required
          />

          <button id="signupButton" type="submit">
            Create Account
          </button>

        </form>

        <p id="signupMessage"></p>

        <button
          id="loginLink"
          class="auth-link"
          type="button"
        >
          Already have an account? Log in
        </button>

      </section>

    </main>
  `;

  const form =
    document.getElementById("signupForm");

  const message =
    document.getElementById("signupMessage");

  const button =
    document.getElementById("signupButton");

  document
    .getElementById("loginLink")
    .addEventListener("click", () => {
      window.location.hash = "#/login";
    });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name =
      document.getElementById("name").value.trim();

    const email =
      document.getElementById("email").value.trim();

    const password =
      document.getElementById("password").value;

    button.disabled = true;
    button.textContent = "Creating account...";
    message.textContent = "";

    try {
      const data = await api.post(
        "/api/auth/signup",
        {
          name,
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

      message.textContent =
        "Account created successfully.";

      window.location.hash = "#/chat";

    } catch (error) {
      message.textContent =
        error.message ||
        "Unable to create your account.";

      button.disabled = false;
      button.textContent = "Create Account";
    }
  });
}
