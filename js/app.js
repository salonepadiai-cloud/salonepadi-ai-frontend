import { renderHome } from "./pages/home.js";
import { renderLogin } from "./pages/login.js";
import { renderSignup } from "./pages/signup.js";
import { renderChat } from "./pages/chat.js";

import {
  authenticated
} from "./auth.js";

const app =
  document.getElementById("app");

function router() {
  if (!app) {
    console.error(
      "SalonePadi AI app container was not found."
    );

    return;
  }

  const route =
    window.location.hash || "#/";

  /*
   * HOME
   */
  if (route === "#/") {
    renderHome(app);
    return;
  }

  /*
   * LOGIN
   */
  if (route === "#/login") {
    renderLogin(app);
    return;
  }

  /*
   * SIGNUP
   */
  if (route === "#/signup") {
    renderSignup(app);
    return;
  }

  /*
   * CHAT
   *
   * Only authenticated users
   * can access the AI chat.
   */
  if (route === "#/chat") {
    if (!authenticated()) {
      window.location.hash =
        "#/login";

      return;
    }

    renderChat(app);
    return;
  }

  /*
   * Unknown route
   *
   * Send the user back home.
   */
  window.location.hash = "#/";
}

window.addEventListener(
  "hashchange",
  router
);

document.addEventListener(
  "DOMContentLoaded",
  router
);
