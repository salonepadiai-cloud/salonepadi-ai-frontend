/* =========================================================
   JOHNNY TEC OS
   APPLICATION CONFIGURATION
   =========================================================

   RESPONSIBILITY:
   - Store public frontend configuration
   - Provide the backend API URL
   - Define the default application route

   IMPORTANT:
   - NEVER put secret API keys here.
   - The frontend communicates with the backend only.
   ========================================================= */


export const CONFIG = {

  /* -----------------------------------------
     APPLICATION
     ----------------------------------------- */

  appName:
    "JOHNNY TEC OS",


  /* -----------------------------------------
     BACKEND
     ----------------------------------------- */

  apiUrl:
    "https://salonepadi-ai-backend.onrender.com",


  /* -----------------------------------------
     ROUTING
     ----------------------------------------- */

  defaultRoute:
    "home"

};


/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

export default CONFIG;
