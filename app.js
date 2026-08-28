/* =========================================================
   JOHNNY TEC OS
   APPLICATION ENTRY
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
      width:100px;
      height:100px;
      border-radius:50%;
      display:grid;
      place-items:center;
      margin-bottom:24px;
      background:radial-gradient(
        circle,
        #ffffff 0 5%,
        #9b6cff 20%,
        #5425d6 45%,
        #160d35 70%,
        #080b14 100%
      );
      box-shadow:0 0 45px rgba(124,77,255,.7);
      font-size:40px;
    ">◉</div>

    <h1 style="margin:0 0 10px;">
      JOHNNY TEC OS
    </h1>

    <p style="
      margin:0;
      color:#a8afc2;
      font-size:16px;
    ">
      System online.
    </p>

    <button
      id="test-home"
      style="
        margin-top:30px;
        padding:14px 24px;
        border:0;
        border-radius:12px;
        background:#7c4dff;
        color:white;
        font-size:16px;
        cursor:pointer;
      "
    >
      Open Home
    </button>

  </main>
`;

document
  .getElementById("test-home")
  .addEventListener("click", () => {

    app.innerHTML = `
      <main style="
        min-height:100vh;
        padding:30px 20px 120px;
      ">

        <h1>Welcome to JOHNNY TEC OS</h1>

        <p style="color:#a8afc2;">
          Home page test is working.
        </p>

        <div style="
          margin-top:25px;
          padding:20px;
          border-radius:20px;
          background:#0e1220;
          border:1px solid rgba(255,255,255,.08);
        ">
          <h2>How can I help you?</h2>

          <input
            placeholder="Ask Johnny anything..."
            style="
              width:100%;
              padding:16px;
              margin-top:15px;
              border-radius:12px;
              border:1px solid rgba(255,255,255,.1);
              background:#080b14;
              color:white;
              outline:none;
            "
          >
        </div>

      </main>
    `;
  });
