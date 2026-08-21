import { api } from "../api.js";

const TOKEN_KEY = "salonepadi_access_token";
const USER_KEY = "salonepadi_user";

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

          <div class="password-field">

            <input
              id="password"
              type="password"
              placeholder="Password"
              autocomplete="new-password"
              minlength="6"
              required
            />

            <button
              id="togglePassword"
              class="password-toggle"
              type="button"
              aria-label="Show password"
              title="Show password"
            >
              👁️
            </button>

          </div>

          <button
            id="signupButton"
            type="submit"
          >
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

  const password =
    document.getElementById("password");

  const togglePassword =
    document.getElementById("togglePassword");

  /*
   * Show / hide password
   */
  togglePassword.addEventListener(
    "click",
    () => {
      const isHidden =
        password.type === "password";

      password.type =
        isHidden ? "text" : "password";

      togglePassword.textContent =
        isHidden ? "🙈" : "👁️";

      togglePassword.setAttribute(
        "aria-label",
        isHidden
          ? "Hide password"
          : "Show password"
      );

      togglePassword.setAttribute(
        "title",
        isHidden
          ? "Hide password"
          : "Show password"
      );
    }
  );

  /*
   * Go to login
   */
  document
    .getElementById("loginLink")
    .addEventListener("click", () => {
      window.location.hash = "#/login";
    });

  /*
   * Create account
   */
  form.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const name =
        document
          .getElementById("name")
          .value
          .trim();

      const email =
        document
          .getElementById("email")
          .value
          .trim()
          .toLowerCase();

      const passwordValue =
        password.value;

      button.disabled = true;
      button.textContent =
        "Creating account...";

      message.textContent = "";
      message.className = "";

      try {
        const data = await api.post(
          "/api/auth/signup",
          {
            name,
            email,
            password: passwordValue
          }
        );

        /*
         * A real login session must exist
         * before entering the AI chat.
         */
        const token =
          data?.session?.access_token;

        const user =
          data?.user;

        if (!token) {
          throw new Error(
            "Account created, but no login session was returned. Please log in."
          );
        }

        if (!user) {
          throw new Error(
            "Account created, but your user session was not returned."
          );
        }

        /*
         * Save authenticated session
         */
        localStorage.setItem(
          TOKEN_KEY,
          token
        );

        localStorage.setItem(
          USER_KEY,
          JSON.stringify(user)
        );

        message.textContent =
          "Account created successfully. Opening SalonePadi AI...";

        message.className =
          "success-message";

        /*
         * Give localStorage a moment to finish
         * before changing the application route.
         */
        setTimeout(() => {
          window.location.hash =
            "#/chat";
        }, 300);

      } catch (error) {
        console.error(
          "Signup error:",
          error
        );

        message.textContent =
          error.message ||
          "Unable to create your account.";

        message.className =
          "error-message";

        button.disabled = false;
        button.textContent =
          "Create Account";
      }
    }
  );
}
