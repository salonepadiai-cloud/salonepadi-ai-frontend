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
            class="home-button home-button-primary"
            id="loginButton"
            type="button"
          >
            Log In
          </button>

          <button
            class="home-button home-button-secondary"
            id="signupButton"
            type="button"
          >
            Create Account
          </button>

        </div>

      </section>

    </main>
  `;

  const loginButton =
    document.getElementById("loginButton");

  const signupButton =
    document.getElementById("signupButton");

  loginButton.addEventListener("click", () => {
    console.log("Login selected");
  });

  signupButton.addEventListener("click", () => {
    console.log("Create account selected");
  });
}
