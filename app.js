/* =========================================================
   JOHNNY TEC OS
   APPLICATION ENTRY
   =========================================================

   RESPONSIBILITY:
   - Start the frontend application
   - Find the application root
   - Load the initial page
   - Control basic page navigation

   This file does NOT:
   - Call the AI backend directly
   - Manage authentication logic
   - Contain page UI
   - Contain component UI
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
   ROUTER
   ========================================================= */

function getRoute() {

  const hash =
    window.location.hash
      .replace("#", "")
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


  app.innerHTML = "";


  switch (route) {

    case "home":

      await renderHome(app);

      break;


    default:

      await renderHome(app);

      break;

  }

}


/* =========================================================
   NAVIGATION LISTENER
   ========================================================= */

window.addEventListener(
  "hashchange",
  renderRoute
);


/* =========================================================
   START APPLICATION
   ========================================================= */

renderRoute();
