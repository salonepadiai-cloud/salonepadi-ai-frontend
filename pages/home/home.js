/* =========================================================
   JOHNNY TEC OS
   HOME PAGE
   ========================================================= */

import "./home.css";


/* =========================================================
   RENDER HOME
   ========================================================= */

export function renderHome(container) {

  if (!container) {
    return;
  }


  container.innerHTML = `
    <main class="home-page">

      <!-- =================================================
           TOP BAR
           ================================================= -->

      <header class="top-bar">

        <button
          class="icon-button menu-button"
          type="button"
          aria-label="Open menu"
        >
          ☰
        </button>


        <div class="brand">

          <div class="brand-orb">
            <span>◉</span>
          </div>

          <div class="brand-text">
            <strong>JOHNNY TEC OS</strong>
            <small>Your intelligent AI assistant</small>
          </div>

        </div>


        <button
          class="icon-button"
          type="button"
          aria-label="Notifications"
        >
          ♧
        </button>

      </header>


      <!-- =================================================
           HERO
           ================================================= -->

      <section class="hero-card">

        <div class="hero-content">

          <span class="hero-label">
            JOHNNY TEC OS
          </span>

          <h1>
            Welcome back 👋
          </h1>

          <p>
            What would you like me to help you with?
          </p>

        </div>


        <form
          class="quick-chat-form"
          id="quick-chat-form"
        >

          <input
            id="quick-chat-input"
            type="text"
            placeholder="Ask Johnny anything..."
            autocomplete="off"
          >


          <button
            type="submit"
            class="send-button"
            aria-label="Send message"
          >
            ➤
          </button>

        </form>

      </section>


      <!-- =================================================
           QUICK ACTIONS
           ================================================= -->

      <section class="quick-actions">

        <button
          class="action-card"
          data-route="chat"
          type="button"
        >
          <span class="action-icon">◉</span>
          <span>Chat</span>
        </button>


        <button
          class="action-card"
          data-route="tools"
          type="button"
        >
          <span class="action-icon">⊞</span>
          <span>Tools</span>
        </button>


        <button
          class="action-card"
          data-route="documents"
          type="button"
        >
          <span class="action-icon">▤</span>
          <span>Documents</span>
        </button>


        <button
          class="action-card"
          data-route="code"
          type="button"
        >
          <span class="action-icon">&lt;/&gt;</span>
          <span>Code</span>
        </button>

      </section>


      <!-- =================================================
           JOHNNY STATUS
           ================================================= -->

      <section class="dashboard-card">

        <div class="section-heading">

          <div class="heading-left">

            <span class="status-dot"></span>

            <h2>Johnny is ready</h2>

          </div>

        </div>


        <p class="status-description">
          Your AI assistant is ready to chat, help
          with tasks, analyze information, and more.
        </p>

      </section>


      <!-- =================================================
           BOTTOM NAVIGATION
           ================================================= -->

      <nav class="bottom-nav">

        <button
          class="nav-item active"
          data-route="home"
          type="button"
        >
          <span>⌂</span>
          <small>Home</small>
        </button>


        <button
          class="nav-item"
          data-route="chat"
          type="button"
        >
          <span>▢</span>
          <small>Chat</small>
        </button>


        <button
          class="orb-nav"
          data-route="chat"
          type="button"
          aria-label="Open Johnny"
        >
          <span>◉</span>
        </button>


        <button
          class="nav-item"
          data-route="tools"
          type="button"
        >
          <span>⊞</span>
          <small>Tools</small>
        </button>


        <button
          class="nav-item"
          data-route="profile"
          type="button"
        >
          <span>♙</span>
          <small>Profile</small>
        </button>

      </nav>

    </main>
  `;


  /* =======================================================
     NAVIGATION
     ======================================================= */

  const navigationButtons =
    container.querySelectorAll(
      "[data-route]"
    );


  navigationButtons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const route =
            button.dataset.route;


          if (!route) {
            return;
          }


          window.location.hash =
            `#/${route}`;

        }
      );

    }
  );


  /* =======================================================
     QUICK CHAT
     ======================================================= */

  const form =
    container.querySelector(
      "#quick-chat-form"
    );


  const input =
    container.querySelector(
      "#quick-chat-input"
    );


  if (form && input) {

    form.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const message =
          input.value.trim();


        if (!message) {
          input.focus();
          return;
        }


        sessionStorage.setItem(
          "johnny_tec_os_pending_message",
          message
        );


        window.location.hash =
          "#/chat";

      }
    );

  }

}


/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

export default renderHome;
