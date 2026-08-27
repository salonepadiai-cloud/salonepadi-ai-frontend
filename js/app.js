/*
|--------------------------------------------------------------------------
| SALONEPADI AI — FRONTEND TEST
|--------------------------------------------------------------------------
*/

const app = document.getElementById("app");

if (!app) {
  throw new Error("SalonePadi AI: #app element was not found.");
}

app.innerHTML = `
  <main style="
    min-height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:24px;
    background:#020617;
    color:#f8fafc;
    font-family:Inter,Arial,sans-serif;
    text-align:center;
  ">

    <div style="
      max-width:600px;
      width:100%;
      padding:40px 28px;
      border:1px solid rgba(59,130,246,.35);
      border-radius:24px;
      background:#0f172a;
      box-shadow:0 20px 60px rgba(0,0,0,.35);
    ">

      <div style="
        font-size:48px;
        margin-bottom:16px;
      ">
        🦁
      </div>

      <h1 style="
        margin:0 0 12px;
        font-size:28px;
      ">
        SalonePadi AI
      </h1>

      <p style="
        margin:0 0 20px;
        color:#94a3b8;
        line-height:1.6;
      ">
        Kushe! 👋
        <br>
        Frontend JavaScript is working.
      </p>

      <div style="
        display:inline-block;
        padding:10px 16px;
        border-radius:10px;
        background:#14532d;
        color:#86efac;
        font-size:13px;
        font-weight:700;
      ">
        ✓ APP.JS LOADED
      </div>

    </div>

  </main>
`;
