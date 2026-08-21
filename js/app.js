import { renderHome } from "./pages/home.js";

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  if (!app) {
    document.body.innerHTML = `
      <div style="padding:30px;font-family:Arial;color:white;background:#050816;min-height:100vh;">
        <h1>SalonePadi AI</h1>
        <p>App container not found.</p>
      </div>
    `;
    return;
  }

  try {
    renderHome(app);
  } catch (error) {
    console.error("SalonePadi AI failed to start:", error);

    app.innerHTML = `
      <div style="padding:30px;font-family:Arial;color:white;">
        <h1>SalonePadi AI</h1>
        <p>Something went wrong while starting the app.</p>
        <small>${error.message}</small>
      </div>
    `;
  }
});
