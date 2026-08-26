/* =========================================
   SalonePadi AI
   Chat Shell

   RESPONSIBILITY:
   Only creates the Chat J HTML structure.

   This file does NOT:
   - Handle authentication
   - Send messages
   - Load conversations
   - Handle sidebar events
   - Handle audio
   - Format AI responses
   - Manage state
   ========================================= */

export function createChatShell(
  container,
  {
    user = null,
    displayName = "User"
  } = {}
) {
  if (!container) {
    return null;
  }

  container.innerHTML = `
    <main class="chat-app">

      <!-- =========================================
           LEFT SIDEBAR
           ========================================= -->

      <aside
        id="leftSidebar"
        class="chat-sidebar chat-sidebar-left"
      >

        <div class="sidebar-header">

          <div class="sidebar-brand">

            <div class="sidebar-logo">
              🦁
            </div>

            <div>
              <strong>SalonePadi</strong>
              <span>AI</span>
            </div>

          </div>

          <button
            id="closeLeftSidebar"
            class="sidebar-close"
            type="button"
            aria-label="Close menu"
          >
            ×
          </button>

        </div>

        <div class="sidebar-content">

          <button
            id="newChatButton"
            class="new-chat-button"
            type="button"
          >
            <span class="new-chat-icon">＋</span>
            <span>New chat</span>
          </button>

          <div class="sidebar-section">

            <div class="sidebar-label">
              Recent chats
            </div>

            <div id="conversationList">
              <div class="conversation-empty">
                Loading chats...
              </div>
            </div>

          </div>

        </div>

        <div class="sidebar-footer">

          <button
            id="settingsButton"
            class="sidebar-action"
            type="button"
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>

          <button
            id="logoutButton"
            class="sidebar-action danger"
            type="button"
          >
            <span>↪</span>
            <span>Log out</span>
          </button>

          <div class="sidebar-user">

            <div class="sidebar-user-avatar">
              🦁
            </div>

            <div class="sidebar-user-info">

              <strong>
                ${escapeHTML(displayName)}
              </strong>

              <span>
                ${escapeHTML(user?.email || "")}
              </span>

            </div>

          </div>

        </div>

      </aside>


      <!-- =========================================
           MAIN CHAT
           ========================================= -->

      <section class="chat-main">

        <header class="chat-header">

          <button
            id="leftMenuButton"
            class="icon-button mobile-menu"
            type="button"
            aria-label="Open sidebar"
          >
            ☰
          </button>

          <div class="chat-brand">

            <div class="chat-logo">
              🦁
            </div>

            <div class="chat-brand-text">

              <strong>
                SalonePadi AI
              </strong>

              <span>
                Your personal AI padi
              </span>

            </div>

          </div>

          <div class="chat-header-actions">

            <button
              id="stopAudioButton"
              class="icon-button chat-audio-stop-button"
              type="button"
              aria-label="Stop audio"
              title="Stop audio"
            >
              ■
            </button>

            <button
              id="rightMenuButton"
              class="icon-button"
              type="button"
              aria-label="Open profile"
            >
              ⋯
            </button>

          </div>

        </header>


        <section class="chat-content">

          <div
            id="messages"
            class="chat-messages"
            aria-live="polite"
            aria-label="Conversation messages"
          ></div>

          <div
            id="chatStatus"
            class="chat-status"
            role="status"
            aria-live="polite"
          ></div>

        </section>


        <!-- =========================================
             COMPOSER
             ========================================= -->

        <div class="composer-area">

          <form
            id="chatForm"
            class="chat-form"
          >

            <div class="composer">

              <textarea
                id="messageInput"
                rows="1"
                placeholder="Message SalonePadi AI..."
                autocomplete="off"
                required
              ></textarea>

              <button
                id="sendButton"
                class="send-button"
                type="submit"
                aria-label="Send message"
              >
                ↑
              </button>

            </div>

          </form>

          <div class="composer-note">
            SalonePadi AI can make mistakes.
            Check important information.
          </div>

        </div>

      </section>


      <!-- =========================================
           RIGHT SIDEBAR / PROFILE
           ========================================= -->

      <aside
        id="rightSidebar"
        class="chat-sidebar chat-sidebar-right"
      >

        <div class="right-sidebar-header">

          <strong>
            Profile
          </strong>

          <button
            id="closeRightSidebar"
            class="sidebar-close"
            type="button"
            aria-label="Close profile"
          >
            ×
          </button>

        </div>


        <div class="profile-card">

          <div class="profile-avatar">
            🦁
          </div>

          <h2>
            ${escapeHTML(displayName)}
          </h2>

          <p>
            ${escapeHTML(user?.email || "")}
          </p>

        </div>


        <div class="right-section">

          <div class="sidebar-label">
            Account
          </div>

          <button
            id="profileButton"
            class="sidebar-action"
            type="button"
          >
            <span>👤</span>
            <span>Profile</span>
          </button>

          <button
            id="settingsButtonRight"
            class="sidebar-action"
            type="button"
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>

        </div>


        <div class="right-section">

          <div class="sidebar-label">
            About SalonePadi
          </div>

          <p class="about-text">
            Your personal AI padi, built with Sierra Leonean
            spirit, technology and warmth. 🦁🇸🇱
          </p>

        </div>

      </aside>


      <!-- =========================================
           MOBILE SIDEBAR OVERLAY
           ========================================= -->

      <div
        id="sidebarOverlay"
        class="sidebar-overlay"
      ></div>

    </main>
  `;


  /* =========================================
     RETURN DOM ELEMENTS

     The controller/modules use these references
     instead of searching the entire document.
     ========================================= */

  return {
    root: container.querySelector(
      ".chat-app"
    ),

    leftSidebar:
      container.querySelector(
        "#leftSidebar"
      ),

    rightSidebar:
      container.querySelector(
        "#rightSidebar"
      ),

    overlay:
      container.querySelector(
        "#sidebarOverlay"
      ),

    leftMenuButton:
      container.querySelector(
        "#leftMenuButton"
      ),

    rightMenuButton:
      container.querySelector(
        "#rightMenuButton"
      ),

    closeLeftSidebar:
      container.querySelector(
        "#closeLeftSidebar"
      ),

    closeRightSidebar:
      container.querySelector(
        "#closeRightSidebar"
      ),

    newChatButton:
      container.querySelector(
        "#newChatButton"
      ),

    settingsButton:
      container.querySelector(
        "#settingsButton"
      ),

    settingsButtonRight:
      container.querySelector(
        "#settingsButtonRight"
      ),

    profileButton:
      container.querySelector(
        "#profileButton"
      ),

    logoutButton:
      container.querySelector(
        "#logoutButton"
      ),

    conversationList:
      container.querySelector(
        "#conversationList"
      ),

    messages:
      container.querySelector(
        "#messages"
      ),

    chatStatus:
      container.querySelector(
        "#chatStatus"
      ),

    stopAudioButton:
      container.querySelector(
        "#stopAudioButton"
      ),

    chatForm:
      container.querySelector(
        "#chatForm"
      ),

    messageInput:
      container.querySelector(
        "#messageInput"
      ),

    sendButton:
      container.querySelector(
        "#sendButton"
      )
  };
}


/* =========================================
   HTML ESCAPE
   ========================================= */

function escapeHTML(value) {
  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
      }
