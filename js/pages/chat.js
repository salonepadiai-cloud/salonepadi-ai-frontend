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

      <!-- LEFT SIDEBAR -->
      <aside
        id="leftSidebar"
        class="chat-sidebar chat-sidebar-left"
      >

        <div class="sidebar-header">

          <div class="sidebar-brand">
            <div class="sidebar-logo">🦁</div>

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
              <button
                class="conversation-item active"
                type="button"
              >
                <span>💬</span>
                <span>New conversation</span>
              </button>
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


      <!-- MAIN CHAT -->
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
              <strong>SalonePadi AI</strong>
              <span>Your personal AI padi</span>
            </div>

          </div>

          <button
            id="rightMenuButton"
            class="icon-button"
            type="button"
            aria-label="Open profile"
          >
            ⋯
          </button>

        </header>


        <!-- CHAT AREA -->
        <section class="chat-content">

          <div
            id="messages"
            class="chat-messages"
          ></div>

          <div
            id="chatStatus"
            class="chat-status"
          ></div>

        </section>


        <!-- COMPOSER -->
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
            SalonePadi AI can make mistakes. Check important information.
          </div>

        </div>

      </section>


      <!-- RIGHT SIDEBAR -->
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


      <!-- MOBILE OVERLAY -->
      <div
        id="sidebarOverlay"
        class="sidebar-overlay"
      ></div>

    </main>
  `;


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


  /*
   * SIDEBAR CONTROLS
   */

  function closeSidebars() {
    leftSidebar.classList.remove("open");
    rightSidebar.classList.remove("open");
    overlay.classList.remove("show");
  }

  function openSidebar(side) {
    closeSidebars();

    if (side === "left") {
      leftSidebar.classList.add("open");
    } else {
      rightSidebar.classList.add("open");
    }

    overlay.classList.add("show");
  }


  document
    .getElementById("leftMenuButton")
    .addEventListener("click", () => {
      openSidebar("left");
    });


  document
    .getElementById("rightMenuButton")
    .addEventListener("click", () => {
      openSidebar("right");
    });


  document
    .getElementById("closeLeftSidebar")
    .addEventListener("click", closeSidebars);


  document
    .getElementById("closeRightSidebar")
    .addEventListener("click", closeSidebars);


  overlay.addEventListener(
    "click",
    closeSidebars
  );


  /*
   * NEW CHAT
   */

  document
    .getElementById("newChatButton")
    .addEventListener(
      "click",
      async () => {

        closeSidebars();

        messages.innerHTML = "";

        conversationId = null;

        try {

          showStatus(
            "Starting a new chat..."
          );

          await createConversation();

          showStatus("");

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


  /*
   * SETTINGS / PROFILE
   */

  for (
    const id of [
      "settingsButton",
      "settingsButtonRight",
      "profileButton"
    ]
  ) {

    document
      .getElementById(id)
      .addEventListener(
        "click",
        () => {

          showStatus(
            "This section will be available soon."
          );

          closeSidebars();

        }
      );

  }


  /*
   * LOGOUT
   */

  document
    .getElementById("logoutButton")
    .addEventListener(
      "click",
      async () => {

        const button =
          document.getElementById(
            "logoutButton"
          );

        button.disabled = true;

        button.innerHTML =
          "<span>⏳</span><span>Logging out...</span>";

        try {

          await logout();

        } finally {

          window.location.hash =
            "#/login";

        }

      }
    );


  /*
   * TEXTAREA
   */

  input.addEventListener(
    "input",
    () => {

      input.style.height = "auto";

      input.style.height =
        `${Math.min(
          input.scrollHeight,
          180
        )}px`;

    }
  );


  /*
   * ENTER TO SEND
   */

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


  /*
   * LOAD CHAT
   */

  try {

    showStatus(
      "Checking your session..."
    );

    await api.get(
      "/api/auth/me"
    );

    showStatus(
      "Starting your chat..."
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
      /session|authentication|invalid|expired/i
        .test(
          error.message || ""
        )
    ) {

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


  /*
   * SEND MESSAGE
   */

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

      input.value = "";

      input.style.height =
        "auto";

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

        if (
          data.message?.content
        ) {

          addMessage(
            "assistant",
            data.message.content
          );

        }

      } catch (error) {

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


  /*
   * CREATE CONVERSATION
   */

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


  /*
   * LOAD MESSAGES
   */

  async function loadMessages() {

    if (!conversationId) {
      return;
    }

    const data =
      await api.get(
        `/api/chat/conversations/${conversationId}/messages`
      );

    messages.innerHTML = "";

    for (
      const message of
      data.messages || []
    ) {

      addMessage(
        message.role,
        message.content
      );

    }

  }


  /*
   * DISPLAY MESSAGE
   */

  function addMessage(
    role,
    content
  ) {

    const row =
      document.createElement(
        "div"
      );

    row.className =
      role === "user"
        ? "message-row message-row-user"
        : "message-row message-row-ai";


    const avatar =
      document.createElement(
        "div"
      );

    avatar.className =
      "message-avatar";

    avatar.textContent =
      role === "user"
        ? "You"
        : "🦁";


    const bubble =
      document.createElement(
        "div"
      );

    bubble.className =
      role === "user"
        ? "message-bubble user-message"
        : "message-bubble ai-message";


    if (role === "assistant") {

      bubble.innerHTML = `
        <div class="message-name">
          SalonePadi AI
        </div>

        <div class="message-text">
          ${formatAIText(content)}
        </div>
      `;

    } else {

      bubble.innerHTML = `
        <div class="message-text">
          ${escapeHTML(content)}
        </div>
      `;

    }


    row.append(
      avatar,
      bubble
    );

    messages.appendChild(row);

    messages.scrollTo({
      top: messages.scrollHeight,
      behavior: "smooth"
    });

  }


  /*
   * AI TEXT
   *
   * Keeps normal text safe while making
   * basic markdown-style formatting readable.
   */

  function formatAIText(value) {

    let text =
      escapeHTML(value);

    text =
      text.replace(
        /```([\s\S]*?)```/g,
        "<pre><code>$1</code></pre>"
      );

    text =
      text.replace(
        /`([^`]+)`/g,
        "<code>$1</code>"
      );

    text =
      text.replace(
        /\*\*([^*]+)\*\*/g,
        "<strong>$1</strong>"
      );

    text =
      text.replace(
        /\n/g,
        "<br>"
      );

    return text;

  }


  /*
   * SENDING STATE
   */

  function setSending(
    sending
  ) {

    input.disabled =
      sending;

    sendButton.disabled =
      sending;

    if (sending) {

      sendButton.innerHTML =
        '<span class="typing-dots"><i></i><i></i><i></i></span>';

    } else {

      sendButton.textContent =
        "↑";

    }

  }


  /*
   * STATUS
   */

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


  /*
   * HTML ESCAPE
   */

  function escapeHTML(
    value
  ) {

    const element =
      document.createElement(
        "div"
      );

    element.textContent =
      String(
        value ?? ""
      );

    return element.innerHTML;

  }
}
