export function renderHome(container) {
  container.innerHTML = `
    <main class="home-page">

      <section class="home-container">

        <div class="home-logo">
          🦁
        </div>

        <h1 class="home-title">
          SalonePadi AI
        </h1>

        <p class="home-subtitle">
          Your personal AI padi.
          Smart, helpful, and built to remember.
        </p>

        <div class="home-actions">

          <button
            id="loginButton"
            class="home-button home-button-primary"
            type="button"
          >
            Log In
          </button>

          <button
            id="signupButton"
            class="home-button home-button-secondary"
            type="button"
          >
            Create Account
          </button>

        </div>

      </section>

    </main>
  `;

  document
    .getElementById("loginButton")
    .addEventListener("click", () => {
      window.location.hash = "#/login";
    });

  document
    .getElementById("signupButton")
    .addEventListener("click", () => {
      window.location.hash = "#/signup";
    });
}
