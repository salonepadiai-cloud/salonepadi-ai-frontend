import { renderHome } from "./pages/home.js";
import { renderLogin } from "./pages/login.js";
import { renderSignup } from "./pages/signup.js";

const app = document.getElementById("app");

function router() {
  if (!app) return;

  const route = window.location.hash || "#/";

  if (route === "#/login") {
    renderLogin(app);
    return;
  }

  if (route === "#/signup") {
    renderSignup(app);
    return;
  }

  renderHome(app);
}

window.addEventListener("hashchange", router);

document.addEventListener("DOMContentLoaded", router);
