/* =========================================================
   JOHNNY TEC OS
   APPLICATION ENTRY
   ========================================================= */

import { renderHome } from "./pages/home/home.js";

const app = document.getElementById("app");

if (!app) {
  throw new Error("JOHNNY TEC OS: #app was not found.");
}

async function startApp() {
  try {
    await renderHome(app);
  } catch (error) {
    console.error("JOHNNY TEC OS: Frontend failed:", error);

    app.innerHTML = `
      <main style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:24px;
        text-align:center;
      ">
        <div>
          <h1>JOHNNY TEC OS</h1>
          <p style="color:#ff5c70;">
            Frontend error. Check the browser console.
          </p>
        </div>
      </main>
    `;
  }
}

startApp();
