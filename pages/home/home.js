/* =========================================================
   JOHNNY TEC OS
   HOME PAGE
   ========================================================= */

import "./home.css";


export async function renderHome(container) {

  if (!container) {
    return;
  }


  container.innerHTML = `
    <main class="home-page">

      <!-- TOP BAR -->
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
            <strong>Johnny Tec OS</strong>
            <small>Your AI Assistant</small>
          </div>

        </div>


        <button
          class="icon-button notification-button"
          type="button"
          aria-label="Notifications"
        >
          ♧
          <span class="notification-dot"></span>
        </button>

      </header>


      <!-- HERO -->
      <section class="hero-card">

        <div class="hero-content">

          <h1>
            Good morning, John 👋
          </h1>

          <p>
            How can I help you today?
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
            type="button"
            class="mic-button"
            aria-label="Voice input"
          >
            ♫
          </button>


          <button
            type="submit"
            class="send-button"
            aria-label="Send message"
          >
            ➤
          </button>

        </form>

      </section>


      <!-- QUICK ACTIONS -->
      <section class="quick-actions">

        <button class="action-card action-purple">
          <span class="action-icon">▤</span>
          <span>Summarize</span>
        </button>

        <button class="action-card action-green">
          <span class="action-icon">✎</span>
          <span>Write</span>
        </button>

        <button class="action-card action-blue">
          <span class="action-icon">&lt;/&gt;</span>
          <span>Code</span>
        </button>

        <button class="action-card action-orange">
          <span class="action-icon">▥</span>
          <span>Analyze</span>
        </button>

      </section>


      <!-- SYSTEM STATUS -->
      <section class="dashboard-card">

        <div class="section-heading">

          <div class="heading-left">

            <span class="status-dot"></span>

            <h2>System Status</h2>

          </div>

          <span class="status-text">
            All systems operational
          </span>

        </div>


        <div class="system-stat">
          <div class="stat-label">
            <span>⚙</span>
            <span>CPU Usage</span>
            <strong>24%</strong>
          </div>

          <div class="progress">
            <span style="width:24%"></span>
          </div>
        </div>


        <div class="system-stat">
          <div class="stat-label">
            <span>▦</span>
            <span>Memory</span>
            <strong>42%</strong>
          </div>

          <div class="progress">
            <span style="width:42%"></span>
          </div>
        </div>


        <div class="system-stat">
          <div class="stat-label">
            <span>▱</span>
            <span>Storage</span>
            <strong>65%</strong>
          </div>

          <div class="progress">
            <span style="width:65%"></span>
          </div>
        </div>

      </section>


      <!-- TODAY -->
      <section class="dashboard-card">

        <div class="section-heading">

          <h2>Today's Overview</h2>

          <button class="see-all">
            See All ›
          </button>

        </div>


        <div class="overview-grid">

          <article class="overview-card purple">
            <span>✓</span>
            <strong>8</strong>
            <small>Tasks Completed</small>
            <em>+2 from yesterday</em>
          </article>


          <article class="overview-card blue">
            <span>◷</span>
            <strong>2.4h</strong>
            <small>Time Saved</small>
            <em>+45m from yesterday</em>
          </article>


          <article class="overview-card orange">
            <span>•••</span>
            <strong>15</strong>
            <small>Questions Answered</small>
            <em>+3 from yesterday</em>
          </article>


          <article class="overview-card green">
            <span>▤</span>
            <strong>6</strong>
            <small>Documents Analyzed</small>
            <em>+2 from yesterday</em>
          </article>

        </div>

      </section>


      <!-- RECENT ACTIVITY -->
      <section class="dashboard-card recent-card">

        <div class="section-heading">

          <h2>Recent Activity</h2>

          <button class="see-all">
            See All ›
          </button>

        </div>


        <div class="activity-list">

          <div class="activity-item">
            <span class="activity-icon purple">•••</span>
            <p>You asked: Explain the theory of relativity in simple terms.</p>
            <time>10:24 AM</time>
          </div>


          <div class="activity-item">
            <span class="activity-icon blue">▤</span>
            <p>Document summarized: <b>Project_Proposal.pdf</b></p>
            <time>Yesterday</time>
          </div>


          <div class="activity-item">
            <span class="activity-icon green">&lt;/&gt;</span>
            <p>Python code generated</p>
            <time>Yesterday</time>
          </div>


          <div class="activity-item">
            <span class="activity-icon orange">•••</span>
            <p>You asked: Best practices for web development?</p>
            <time>2 days ago</time>
          </div>

        </div>

      </section>


      <!-- BOTTOM NAV -->
      <nav class="bottom-nav">

        <button class="nav-item active">
          <span>⌂</span>
          <small>Home</small>
        </button>


        <button
          class="nav-item"
          data-route="chat"
        >
          <span>▢</span>
          <small>Chat</small>
        </button>


        <button
          class="orb-nav"
          aria-label="Johnny"
        >
          <span>◉</span>
        </button>


        <button
          class="nav-item"
          data-route="tools"
        >
          <span>⊞</span>
          <small>Tools</small>
        </button>


        <button
          class="nav-item"
          data-route="profile"
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

  container
    .querySelectorAll("[data-route]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          window.location.hash =
            `#/${button.dataset.route}`;

        }
      );

    });


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
          return;
        }


        /*
         * Chat page will handle the actual
         * backend conversation.
         */

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


export default renderHome;
