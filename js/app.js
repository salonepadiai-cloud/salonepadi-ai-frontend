/*
|--------------------------------------------------------------------------
| SALONEPADI AI — APPLICATION ROUTER
|--------------------------------------------------------------------------
*/

const app = document.getElementById("app");

if (!app) {
  throw new Error(
    "SalonePadi AI: #app element was not found."
  );
}


/*
|--------------------------------------------------------------------------
| ROUTE
|--------------------------------------------------------------------------
*/

function getRoute() {

  const hash =
    window.location.hash
      .replace(/^#\/?/, "")
      .split("?")[0]
      .trim();

  return hash || "home";
}


/*
|--------------------------------------------------------------------------
| LOADING SCREEN
|--------------------------------------------------------------------------
*/

function showLoading() {

  app.innerHTML = `
    <main style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#020617;
      color:#f8fafc;
      font-family:Arial,sans-serif;
    ">

      <div style="
        text-align:center;
      ">

        <div style="
          font-size:48px;
          margin-bottom:16px;
        ">
          🦁
        </div>

        <h2 style="
          margin:0 0 8px;
        ">
          SalonePadi AI
        </h2>

        <p style="
          margin:0;
          color:#64748b;
        ">
          Loading...
        </p>

      </div>

    </main>
  `;
}


/*
|--------------------------------------------------------------------------
| ERROR SCREEN
|--------------------------------------------------------------------------
*/

function showError(error) {

  console.error(
    "SalonePadi AI route error:",
    error
  );

  app.innerHTML = `
    <main style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:24px;
      background:#020617;
      color:#f8fafc;
      font-family:Arial,sans-serif;
    ">

      <section style="
        width:100%;
        max-width:600px;
        padding:28px;
        border-radius:20px;
        background:#0f172a;
        border:1px solid rgba(239,68,68,.35);
      ">

        <div style="
          font-size:40px;
          margin-bottom:12px;
        ">
          ⚠️
        </div>

        <h2>
          SalonePadi AI could not load this page
        </h2>

        <p style="
          color:#94a3b8;
          line-height:1.6;
        ">
          The application started, but one of the page
          modules failed to load.
        </p>

        <pre style="
          white-space:pre-wrap;
          overflow:auto;
          padding:14px;
          border-radius:10px;
          background:#020617;
          color:#fca5a5;
          font-size:12px;
        ">${escapeHTML(
          error?.message || String(error)
        )}</pre>

        <button
          id="errorHomeButton"
          style="
            margin-top:14px;
            padding:12px 18px;
            border:0;
            border-radius:10px;
            background:#2563eb;
            color:white;
            font-weight:700;
            cursor:pointer;
          "
        >
          Back to Home
        </button>

      </section>

    </main>
  `;

  document
    .getElementById("errorHomeButton")
    ?.addEventListener(
      "click",
      () => {
        window.location.hash = "#/home";
      }
    );
}


/*
|--------------------------------------------------------------------------
| HTML ESCAPE
|--------------------------------------------------------------------------
*/

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/*
|--------------------------------------------------------------------------
| RENDER ROUTE
|--------------------------------------------------------------------------
*/

async function renderRoute() {

  const route = getRoute();

  showLoading();

  try {

    switch (route) {

      /*
      |--------------------------------------------------------------------------
      | HOME
      |--------------------------------------------------------------------------
      */

      case "home": {

        const module =
          await import("./pages/home.js");

        module.renderHome(app);

        break;
      }


      /*
      |--------------------------------------------------------------------------
      | LOGIN
      |--------------------------------------------------------------------------
      */

      case "login": {

        const module =
          await import("./pages/login.js");

        module.renderLogin(app);

        break;
      }


      /*
      |--------------------------------------------------------------------------
      | SIGNUP
      |--------------------------------------------------------------------------
      */

      case "signup": {

        const module =
          await import("./pages/signup.js");

        module.renderSignup(app);

        break;
      }


      /*
      |--------------------------------------------------------------------------
      | CHAT
      |--------------------------------------------------------------------------
      */

      case "chat": {

        const module =
          await import("./pages/chat.js");

        module.renderChat(app);

        break;
      }


      /*
      |--------------------------------------------------------------------------
      | UNKNOWN ROUTE
      |--------------------------------------------------------------------------
      */

      default:

        window.location.hash = "#/home";

        break;
    }

  } catch (error) {

    showError(error);

  }

}


/*
|--------------------------------------------------------------------------
| ROUTER EVENTS
|--------------------------------------------------------------------------
*/

window.addEventListener(
  "hashchange",
  renderRoute
);


/*
|--------------------------------------------------------------------------
| START APPLICATION
|--------------------------------------------------------------------------
*/

renderRoute();
