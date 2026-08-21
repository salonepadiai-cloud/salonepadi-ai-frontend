import { renderHome } from "./pages/home.js";

const app = document.getElementById("app");

if (!app) {
  throw new Error(
    "SalonePadi AI app container was not found."
  );
}

function startApp() {
  const route = window.location.hash || "#/";

  if (route === "#/") {
    renderHome(app);
    return;
  }

  if (route === "#/login") {
    window.location.hash = "#/";
    return;
  }

  if (route === "#/signup") {
    window.location.hash = "#/";
    return;
  }

  renderHome(app);
}

window.addEventListener("hashchange", startApp);

startApp();
