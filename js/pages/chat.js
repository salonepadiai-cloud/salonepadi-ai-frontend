import {
  authenticated,
  currentUser,
  logout
} from "../auth.js";

import { api } from "../api.js";

let conversationId = null;

export async function renderChat(container) {
  if (!authenticated()) {
    window.location.hash = "#/login";
    return;
  }

  const user = currentUser();

  const displayName =
    user?.user_metadata?.name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  container.innerHTML = `
    <main class="chat-app">

      <!-- =========================
           MOBILE OVERLAY
           ========================= -->
      <div
        id="sidebarOverlay"
        class="sidebar-overlay"
      ></div>


      <!-- =========================
           LEFT SIDEBAR
           ========================= -->
      <aside
        id="leftSidebar"
        class="app-sidebar left-sidebar"
      >

        <div class="sidebar-top">

          <div class="sidebar-brand">
            <div class="sidebar-brand-logo">
              🦁
            </div>

            <div>
              <strong>SalonePadi AI</strong>
              <span>Your AI padi</span>
            </div>
          </div>

          <button
            id="closeLeftSidebar"
            class="sidebar-close"
            type="button"
            aria-label="Close sidebar"
          >
            ×
          </button>

        </div>


        <button
          id="newChatButton"
          class="new-chat-button"
          type="button"
        >
          <span class="new-chat-icon">＋</span>
          <span>New chat</span>
        </button>


        <div class="sidebar-section">

          <div class="sidebar-section-title">
            <span>Recent chats</span>
          </div>

          <div
            id="conversationList"
            class="conversation-list"
          >

            <button
              class="conversation-item active"
              type="button"
            >
              <span>💬</span>
              <span>New conversation</span>
            </button>

          </div>

        </div>


        <div class="sidebar-bottom">

          <button
            id="settingsButton"
            class="sidebar-action"
            type="button"
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>

          <button
            id="profileButton"
            class="sidebar-profile"
            type="button"
          >

            <div class="profile-avatar">
              ${escapeHTML(
                displayName
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            <div class="profile-info">
              <strong>
                ${escapeHTML(displayName)}
              </strong>

              <span>
                Personal account
              </span>
            </div>

            <span class="profile-more">
              ⋯
            </span>

          </button>

        </div>

      </aside>


      <!-- =========================
           MAIN APP
           ========================= -->
      <section class="chat-main">


        <!-- HEADER -->
        <header class="chat-header">

          <div class="header-left">

            <button
              id="openLeftSidebar"
              class="icon-button menu-button"
              type="button"
              aria-label="Open chats"
            >
              ☰
            </button>

            <div class="mobile-brand">
              <div class="mobile-brand-logo">
                🦁
              </div>

              <strong>
                SalonePadi AI
              </strong>
            </div>

          </div>


          <div class="header-center">

            <span class="header-title">
              SalonePadi AI
            </span>

          </div>


          <div class="header-right">

            <button
              id="openRightSidebar"
              class="icon-button"
              type="button"
              aria-label="Open settings"
            >
              ⚙️
            </button>

          </div>

        </header>


        <!-- CHAT CONTENT -->
        <section class="chat-content">

          <div
            id="messages"
            class="chat-messages"
          >

            <div
              id="welcomeMessage"
              class="welcome-message"
            >

              <div class="welcome-logo">
                🦁
              </div>

              <h1>
                How can I help you?
              </h1>

              <p>
                Your personal AI padi,
                always ready to help.
              </p>

              <div class="suggestion-grid">

                <button
                  class="suggestion-card"
                  type="button"
                  data-message="Tell me something interesting about Sierra Leone."
                >
                  <span>🇸🇱</span>
                  <strong>
                    Tell me something
                  </strong>
                  <small>
                    About Sierra Leone
                  </small>
                </button>

                <button
                  class="suggestion-card"
                  type="button"
                  data-message="Help me plan my day."
                >
                  <span>📅</span>
                  <strong>
                    Plan my day
                  </strong>
                  <small>
                    Organize my tasks
                  </small>
                </button>

                <button
                  class="suggestion-card"
                  type="button"
                  data-message="Help me write something."
                >
                  <span>✍️</span>
                  <strong>
                    Help me write
                  </strong>
                  <small>
                    Create something
                  </small>
                </button>

                <button
                  class="suggestion-card"
                  type="button"
                  data-message="Teach me something new."
                >
                  <span>💡</span>
                  <strong>
                    Teach me
                  </strong>
                  <small>
                    Learn something new
                  </small>
                </button>

              </div>

            </div>

          </div>


          <!-- STATUS -->
          <div
            id="chatStatus"
            class="chat-status"
          ></div>


          <!-- COMPOSER -->
          <div class="composer-area">

            <form
              id="chatForm"
              class="chat-form"
            >

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
                <span>↑</span>
              </button>

            </form>

            <div class="composer-hint">
              SalonePadi AI can make mistakes.
              Check important information.
            </div>

          </div>

        </section>

      </section>


      <!-- =========================
           RIGHT SETTINGS SIDEBAR
           ========================= -->
      <aside
        id="rightSidebar"
        class="app-sidebar right-sidebar"
      >

        <div class="settings-header">

          <strong>
            Settings
          </strong>

          <button
            id="closeRightSidebar"
            class="sidebar-close"
            type="button"
            aria-label="Close settings"
          >
            ×
          </button>

        </div>


        <div class="settings-profile">

          <div class="large-profile-avatar">
            ${escapeHTML(
              displayName
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          <strong>
            ${escapeHTML(displayName)}
          </strong>

          <span>
            ${escapeHTML(
              user?.email || ""
            )}
          </span>

        </div>


        <div class="settings-group">

          <div class="settings-title">
            Personalization
          </div>

          <button
            class="settings-item"
            type="button"
          >
            <span>🎨</span>

            <div>
              <strong>Appearance</strong>
              <small>Dark mode</small>
            </div>

            <span>›</span>
          </button>

          <button
            class="settings-item"
            type="button"
          >
            <span>🧠</span>

            <div>
              <strong>Memory</strong>
              <small>Manage what AI remembers</small>
            </div>

            <span>›</span>
          </button>

        </div>


        <div class="settings-group">

          <div class="settings-title">
            Account
          </div>

          <button
            id="settingsLogout"
            class="settings-item danger"
            type="button"
          >
            <span>↪</span>

            <div>
              <strong>Log out</strong>
              <small>
                Sign out of SalonePadi AI
              </small>
            </div>

            <span>›</span>
          </button>

        </div>


        <div class="settings-footer">
          <div>SalonePadi AI</div>
          <span>Personal AI padi</span>
        </div>

      </aside>

    </main>
  `;


  /* =====================================================
     ELEMENTS
     ===================================================== */

  const messages =
    document.getElementById("messages");

  const form =
    document.getElementById("chatForm");

  const input =
    document.getElementById("messageInput");

  const sendButton =
    document.getElementById("sendButton");

  const status =
    document.getElementById("chatStatus");

  const leftSidebar =
    document.getElementById("leftSidebar");

  const rightSidebar =
    document.getElementById("rightSidebar");

  const overlay =
    document.getElementById("sidebarOverlay");


  /* =====================================================
     SIDEBAR CONTROLS
     ===================================================== */

  function openLeftSidebar() {
    leftSidebar.classList.add("open");
    overlay.classList.add("show");
  }

  function closeLeftSidebar() {
    leftSidebar.classList.remove("open");

    if (
      !rightSidebar.classList.contains("open")
    ) {
      overlay.classList.remove("show");
    }
  }

  function openRightSidebar() {
    rightSidebar.classList.add("open");
    overlay.classList.add("show");
  }

  function closeRightSidebar() {
    rightSidebar.classList.remove("open");

    if (
      !leftSidebar.classList.contains("open")
    ) {
      overlay.classList.remove("show");
    }
  }


  document
    .getElementById("openLeftSidebar")
    .addEventListener(
      "click",
      openLeftSidebar
    );

  document
    .getElementById("closeLeftSidebar")
    .addEventListener(
      "click",
      closeLeftSidebar
    );

  document
    .getElementById("openRightSidebar")
    .addEventListener(
      "click",
      openRightSidebar
    );

  document
    .getElementById("closeRightSidebar")
    .addEventListener(
      "click",
      closeRightSidebar
    );

  overlay.addEventListener(
    "click",
    () => {
      closeLeftSidebar();
      closeRightSidebar();
    }
  );


  document
    .getElementById("settingsButton")
    .addEventListener(
      "click",
      () => {
        closeLeftSidebar();
        openRightSidebar();
      }
    );

  document
    .getElementById("profileButton")
    .addEventListener(
      "click",
      () => {
        closeLeftSidebar();
        openRightSidebar();
      }
    );


  /* =====================================================
     NEW CHAT
     ===================================================== */

  document
    .getElementById("newChatButton")
    .addEventListener(
      "click",
      async () => {

        conversationId = null;

        messages.innerHTML = `
          <div class="welcome-message">
            <div class="welcome-logo">
              🦁
            </div>

            <h1>
              How can I help you?
            </h1>

            <p>
              Your personal AI padi,
              always ready to help.
            </p>
          </div>
        `;

        closeLeftSidebar();

        try {
          await createConversation();
          input.focus();
        } catch (error) {
          showStatus(
            error.message ||
            "Unable to start a new chat.",
            true
          );
        }
      }
    );


  /* =====================================================
     SUGGESTIONS
     ===================================================== */

  document
    .querySelectorAll(
      ".suggestion-card"
    )
    .forEach(
      (card) => {
        card.addEventListener(
          "click",
          () => {
            input.value =
              card.dataset.message || "";

            input.focus();

            input.style.height =
              "auto";

            input.style.height =
              `${Math.min(
                input.scrollHeight,
                140
              )}px`;
          }
        );
      }
    );


  /* =====================================================
     LOGOUT
     ===================================================== */

  async function performLogout() {

    try {
      await logout();
    } finally {
      window.location.hash =
        "#/login";
    }
  }

  document
    .getElementById("settingsLogout")
    .addEventListener(
      "click",
      performLogout
    );


  /* =====================================================
     SESSION + CHAT INITIALIZATION
     ===================================================== */

  try {

    showStatus(
      "Starting your chat..."
    );

    await api.get(
      "/api/auth/me"
    );

    await createConversation();

    await loadMessages();

    showStatus("");

    input.focus();

  } catch (error) {

    console.error(
      "Chat initialization error:",
      error
    );

    if (
      error.message
        ?.toLowerCase()
        .includes("session") ||
      error.message
        ?.toLowerCase()
        .includes("authentication") ||
      error.message
        ?.toLowerCase()
        .includes("invalid")
    ) {

      localStorage.removeItem(
        "salonepadi_access_token"
      );

      localStorage.removeItem(
        "salonepadi_user"
      );

      window.location.hash =
        "#/login";

      return;
    }

    showStatus(
      error.message ||
      "Unable to load your chat.",
      true
    );
  }


  /* =====================================================
     INPUT AUTO RESIZE
     ===================================================== */

  input.addEventListener(
    "input",
    () => {

      input.style.height =
        "auto";

      input.style.height =
        `${Math.min(
          input.scrollHeight,
          140
        )}px`;
    }
  );


  /* =====================================================
     ENTER TO SEND
     ===================================================== */

  input.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        form.requestSubmit();
      }
    }
  );


  /* =====================================================
     SEND MESSAGE
     ===================================================== */

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const message =
        input.value.trim();

      if (
        !message ||
        !conversationId
      ) {
        return;
      }

      const welcome =
        document.getElementById(
          "welcomeMessage"
        );

      if (welcome) {
        welcome.remove();
      }

      input.value = "";
      input.style.height = "auto";

      addMessage(
        "user",
        message
      );

      setSending(true);

      try {

        const data =
          await api.post(
            `/api/chat/conversations/${conversationId}/messages`,
            {
              message
            }
          );

        const assistantMessage =
          data.message;

        if (
          assistantMessage?.content
        ) {

          addMessage(
            "assistant",
            assistantMessage.content
          );

        } else {

          showStatus(
            "SalonePadi AI did not return a response.",
            true
          );
        }

      } catch (error) {

        console.error(
          "AI message error:",
          error
        );

        showStatus(
          error.message ||
          "Unable to generate AI response.",
          true
        );

      } finally {

        setSending(false);

        input.focus();
      }
    }
  );


  /* =====================================================
     CREATE CONVERSATION
     ===================================================== */

  async function createConversation() {

    const data =
      await api.post(
        "/api/chat/conversations",
        {
          title: "New Chat"
        }
      );

    if (
      !data.conversation?.id
    ) {
      throw new Error(
        "The server did not return a conversation."
      );
    }

    conversationId =
      data.conversation.id;
  }


  /* =====================================================
     LOAD MESSAGES
     ===================================================== */

  async function loadMessages() {

    if (!conversationId) {
      return;
    }

    const data =
      await api.get(
        `/api/chat/conversations/${conversationId}/messages`
      );

    const existingMessages =
      data.messages || [];

    if (
      existingMessages.length === 0
    ) {
      return;
    }

    const welcome =
      document.getElementById(
        "welcomeMessage"
      );

    if (welcome) {
      welcome.remove();
    }

    for (
      const message of existingMessages
    ) {

      addMessage(
        message.role,
        message.content
      );
    }
  }


  /* =====================================================
     DISPLAY MESSAGE
     ===================================================== */

  function addMessage(
    role,
    content
  ) {

    const element =
      document.createElement("div");

    element.className =
      role === "user"
        ? "user-message"
        : "ai-message";

    if (
      role === "assistant"
    ) {

      element.innerHTML = `
        <div class="message-avatar">
          🦁
        </div>

        <div class="message-body">

          <strong>
            SalonePadi AI
          </strong>

          <p>
            ${escapeHTML(content)}
          </p>

        </div>
      `;

    } else {

      element.innerHTML = `
        <div class="message-body">
          <p>
            ${escapeHTML(content)}
          </p>
        </div>
      `;
    }

    messages.appendChild(
      element
    );

    requestAnimationFrame(
      () => {
        messages.scrollTop =
          messages.scrollHeight;
      }
    );
  }


==========================
     SENDING STATE
  ===================================================== */

  function setSending(
    sending
  ) {

    input.disabled =
      sending;

    sendButton.disabled =
      sending;

    if (sending) {

      sendButton.innerHTML = `
        <span class="thinking-dots">
          •••
        </span>
      `;

    } else {

      sendButton.innerHTML =
        "<span>↑</span>";
    }
  }


  /* =====================================================
     STATUS
     ===================================================== */

  function showStatus(
    message,
    isError = false
  ) {

    status.textContent =
      message;

    status.className =
      isError
        ? "chat-status chat-error"
        : "chat-status";
  }


  /* =====================================================
     ESCAPE HTML
     ===================================================== */

  function escapeHTML(
    value
  ) {

    const element =
      document.createElement(
        "div"
      );

    element.textContent =
      String(value ?? "");

    return element.innerHTML;
  }
}
