import { renderHome } from "./pages/home.js";
import { renderLogin } from "./pages/login.js";
import { renderSignup } from "./pages/signup.js";

const app = document.getElementById("app");

if (!app) {
  throw new Error(
    "SalonePadi AI app container was not found."
  );
}

function startApp() {
  const route =
    window.location.hash || "#/";

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

window.addEventListener(
  "hashchange",
  startApp
);

startApp();
