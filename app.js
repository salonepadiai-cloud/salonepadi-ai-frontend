/* =========================================================
   JOHNNY TEC OS
   FRONTEND BOOT TEST
   ========================================================= */

const app = document.getElementById("app");

if (!app) {
  throw new Error("JOHNNY TEC OS: #app was not found.");
}

app.innerHTML = `
  <main style="
    min-height:100vh;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    padding:24px;
    text-align:center;
  ">

    <div style="
      width:90px;
      height:90px;
      border-radius:50%;
      display:grid;
      place-items:center;
      margin-bottom:24px;
      background:radial-gradient(
        circle,
        #d8caff 0 8%,
        #764cff 25%,
        #24104d 62%,
        #090b15 100%
      );
      box-shadow:0 0 35px rgba(124,77,255,.6);
      font-size:36px;
    ">
      ◉
    </div>

    <h1 style="margin:0 0 10px;">
      JOHNNY TEC OS
    </h1>

    <p style="
      margin:0;
      color:#a8afc2;
      font-size:16px;
    ">
      Frontend is alive.
    </p>

  </main>
`;
