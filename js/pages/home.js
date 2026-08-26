import { CONFIG } from "../config.js";


/*
|--------------------------------------------------------------------------
| HOME PAGE
|--------------------------------------------------------------------------
|
| Main landing page for Johnny Tec OS.
|
| Branding is loaded from CONFIG so the app name and logo
| can be changed from one central file without editing
| every page.
|
|--------------------------------------------------------------------------
*/

export function renderHome(container) {

  container.innerHTML = `
    <main class="home-page">

      <section class="home-container">


        <!-- =====================================================
             APP LOGO
             ===================================================== -->

        <div class="home-logo">

          <img
            src="${CONFIG.logo}"
            alt="${CONFIG.logoAlt}"
            class="home-logo-image"
          >

        </div>


        <!-- =====================================================
             APP NAME
             ===================================================== -->

        <h1 class="home-title">
          ${CONFIG.appName}
        </h1>


        <!-- =====================================================
             APP DESCRIPTION
             ===================================================== -->

        <p class="home-subtitle">
          Your personal AI system.
          Smart, helpful, and built to remember.
        </p>


        <!-- =====================================================
             AUTH ACTIONS
             ===================================================== -->

        <div class="home-actions">


          <!-- LOGIN -->

          <button
            id="loginButton"
            class="home-button home-button-primary"
            type="button"
          >
            Log In
          </button>


          <!-- CREATE ACCOUNT -->

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


  /*
  |--------------------------------------------------------------------------
  | LOGIN BUTTON
  |--------------------------------------------------------------------------
  */

  const loginButton =
    document.getElementById(
      "loginButton"
    );


  if (loginButton) {

    loginButton.addEventListener(
      "click",
      () => {

        window.location.hash =
          "#/login";

      }
    );

  }


  /*
  |--------------------------------------------------------------------------
  | SIGNUP BUTTON
  |--------------------------------------------------------------------------
  */

  const signupButton =
    document.getElementById(
      "signupButton"
    );


  if (signupButton) {

    signupButton.addEventListener(
      "click",
      () => {

        window.location.hash =
          "#/signup";

      }
    );

  }

}
