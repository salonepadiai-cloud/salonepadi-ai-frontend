import { renderHome } from "./pages/home.js";

const app = document.getElementById("app");

function startApp() {
  if (!app) {
    throw new Error("SalonePadi AI app container was not found.");
  }

  renderHome(app);
}

startApp();
