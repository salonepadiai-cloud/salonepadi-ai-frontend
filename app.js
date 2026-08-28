/* =========================================================
   JOHNNY TEC OS
   APPLICATION ENTRY
   =========================================================

   RESPONSIBILITY:
   - Start the frontend application
   - Find the application root
   - Control basic hash navigation
   - Render the requested page

   This file does NOT:
   - Call the AI backend directly
   - Manage authentication
   - Contain page UI
   - Contain component UI
   ========================================================= */


/* =========================================================
   PAGE IMPORTS
   ========================================================= */

import {
  renderHome
} from "./pages/home/home.js";


/* =========================================================
   APPLICATION ROOT
   ========================================================= */

const app =
  document.getElementById("app");


/* =========================================================
   SAFETY CHECK
   ========================================================= */

if (!app) {

  throw new Error(
    "JOHNNY TEC OS: Application root #app was not found."
  );

}


/* =========================================================
   ROUTE
   ========================================================= */

function getRoute() {

  const hash =
    window.location.hash
      .replace(/^#/, "")
      .trim();


  if (!hash) {

    return "home";

  }


  return hash
    .replace(/^\/+/, "")
    .split("/")[0]
    .toLowerCase();

}


/* =========================================================
   RENDER ROUTE
   ========================================================= */

async function renderRoute() {

  const route =
    getRoute();


  /*
   * Clear the previous page.
   */

  app.innerHTML = "";


  try {

    switch (route) {

      case "home":

        await renderHome(app);

        break;


      /*
       * Pages will be added here one
       * at a time as we build JOHNNY TEC OS.
       */

      default:

        await renderHome(app);

        break;

    }

  } catch (error) {

    console.error(
      "JOHNNY TEC OS: Page rendering failed:",
      error
    );


    app.innerHTML = `
      <main
        style="
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:24px;
          text-align:center;
        "
      >
        <section>
          <h1>JOHNNY TEC OS</h1>

          <p>
            Something went wrong while loading this page.
          </p>

          <button
            type="button"
            id="retry-app"
            style="
              margin-top:16px;
              padding:12px 20px;
              border-radius:12px;
              cursor:pointer;
            "
          >
            Try Again
          </button>
        </section>
      </main>
    `;


    const retryButton =
      document.getElementById(
        "retry-app"
      );


    if (retryButton) {

      retryButton.addEventListener(
        "click",
        renderRoute
      );

    }

  }

}


/* =========================================================
   NAVIGATION
   ========================================================= */

window.addEventListener(
  "hashchange",
  renderRoute
);


/* =========================================================
   START APPLICATION
   ========================================================= */

renderRoute();
