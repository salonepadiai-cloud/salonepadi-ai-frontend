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
      <aside id="leftSidebar" class="chat-sidebar chat-sidebar-left">

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
              <strong>${escapeHTML(displayName)}</strong>

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

          <strong>Profile</strong>

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

          <h2>${escapeHTML(displayName)}</h2>

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
   * SIDEBARS
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

          showStatus("Starting a new chat...");

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

    /*
     * Activate copy buttons after inserting
     * the message into the DOM.
     */

    bubble
      .querySelectorAll(".code-copy-button")
      .forEach(button => {

        button.addEventListener(
          "click",
          async () => {

            const code =
              button
                .closest(".code-block")
                ?.querySelector("code")
                ?.textContent || "";

            try {

              await navigator.clipboard.writeText(
                code
              );

              const original =
                button.textContent;

              button.textContent =
                "Copied ✓";

              button.classList.add(
                "copied"
              );

              setTimeout(() => {

                button.textContent =
                  original;

                button.classList.remove(
                  "copied"
                );

              }, 1600);

            } catch (error) {

              console.warn(
                "Unable to copy code:",
                error
              );

              button.textContent =
                "Copy failed";

            }

          }
        );

      });


    messages.scrollTo({
      top: messages.scrollHeight,
      behavior: "smooth"
    });

  }


function formatAIText(value) {
  let text = String(value ?? "");

  /*
   * Protect code blocks before escaping HTML.
   */
  const codeBlocks = [];

  text = text.replace(
    /```([\w+-]*)\n?([\s\S]*?)```/g,
    (match, language, code) => {
      const index = codeBlocks.length;

      let highlightedCode;

      const cleanCode = code
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim();

      try {
        if (
          window.hljs &&
          language &&
          hljs.getLanguage(language)
        ) {
          highlightedCode =
            hljs.highlight(
              cleanCode,
              {
                language
              }
            ).value;
        } else if (window.hljs) {
          highlightedCode =
            hljs.highlightAuto(
              cleanCode
            ).value;
        } else {
          highlightedCode =
            escapeHTML(cleanCode);
        }
      } catch (error) {
        console.warn(
          "Code highlighting failed:",
          error
        );

        highlightedCode =
          escapeHTML(cleanCode);
      }

      const languageName =
        language || "code";

      codeBlocks.push(`
        <div class="code-block">

          <div class="code-header">

            <span class="code-language">
              ${escapeHTML(languageName)}
            </span>

            <button
              type="button"
              class="copy-code-button"
              data-code-index="${index}"
            >
              Copy
            </button>

          </div>

          <pre><code>${highlightedCode}</code></pre>

        </div>
      `);

      return `___SALONEPADI_CODE_${index}___`;
    }
  );

  /*
   * Escape normal text.
   */
  text = escapeHTML(text);

  /*
   * Bold.
   */
  text = text.replace(
    /\*\*([^*]+)\*\*/g,
    "<strong>$1</strong>"
  );

  /*
   * Inline code.
   */
  text = text.replace(
    /`([^`]+)`/g,
    "<code class=\"inline-code\">$1</code>"
  );

  /*
   * Headings.
   */
  text = text.replace(
    /^### (.+)$/gm,
    "<h4>$1</h4>"
  );

  text = text.replace(
    /^## (.+)$/gm,
    "<h3>$1</h3>"
  );

  text = text.replace(
    /^# (.+)$/gm,
    "<h2>$1</h2>"
  );

  /*
   * Bullet points.
   */
  text = text.replace(
    /^[•*-] (.+)$/gm,
    "<div class=\"ai-list-item\">• $1</div>"
  );

  /*
   * Numbered lists.
   */
  text = text.replace(
    /^(\d+)\. (.+)$/gm,
    "<div class=\"ai-list-item\">$1. $2</div>"
  );

  /*
   * Line breaks.
   */
  text = text.replace(
    /\n/g,
    "<br>"
  );

  /*
   * Restore code blocks.
   */
  codeBlocks.forEach(
    (block, index) => {
      text = text.replace(
        `___SALONEPADI_CODE_${index}___`,
        block
      );
    }
  );

  return text;
}


    /*
     * Escape all remaining normal text.
     */

    text =
      escapeHTML(text);


    /*
     * Inline code.
     */

    text =
      text.replace(
        /`([^`\n]+)`/g,
        "<code class=\"inline-code\">$1</code>"
      );


    /*
     * Bold.
     */

    text =
      text.replace(
        /\*\*([\s\S]*?)\*\*/g,
        "<strong>$1</strong>"
      );


    /*
     * Italic.
     */

    text =
      text.replace(
        /(^|[^*])\*([^*\n]+)\*(?!\*)/g,
        "$1<em>$2</em>"
      );


    /*
     * Headings.
     */

    text =
      text.replace(
        /^### (.+)$/gm,
        "<h4>$1</h4>"
      );

    text =
      text.replace(
        /^## (.+)$/gm,
        "<h3>$1</h3>"
      );

    text =
      text.replace(
        /^# (.+)$/gm,
        "<h2>$1</h2>"
      );


    /*
     * Unordered lists.
     */

    text =
      text.replace(
        /^[ \t]*[-*] (.+)$/gm,
        '<div class="markdown-list-item"><span>•</span><span>$1</span></div>'
      );


    /*
     * Numbered lists.
     */

    text =
      text.replace(
        /^[ \t]*(\d+)\. (.+)$/gm,
        '<div class="markdown-number-item"><span>$1.</span><span>$2</span></div>'
      );


    /*
     * Links.
     *
     * Only allow normal HTTP/HTTPS links.
     */

    text =
      text.replace(
        /https?:\/\/[^\s<]+/g,
        url => {

          const safeURL =
            escapeAttribute(url);

          return `
            <a
              class="ai-link"
              href="${safeURL}"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${escapeHTML(url)}
            </a>
          `;

        }
      );


    /*
     * Preserve line breaks.
     */

    text =
      text.replace(
        /\n/g,
        "<br>"
      );


    /*
     * Restore code blocks.
     */

    codeBlocks.forEach(
      (
        block,
        index
      ) => {

        const placeholder =
          `@@CODE_BLOCK_${index}@@`;

        const escapedCode =
          escapeHTML(
            block.code
          );

        const codeHTML = `
          <div class="code-block">

            <div class="code-header">

              <span class="code-language">
                ${escapeHTML(
                  block.language
                )}
              </span>

              <button
                type="button"
                class="code-copy-button"
                aria-label="Copy code"
              >
                Copy
              </button>

            </div>

            <pre><code>${escapedCode}</code></pre>

          </div>
        `;

        text =
          text.replace(
            placeholder,
            codeHTML
          );

      }
    );


    return text;

  }


  /*
   * SAFE HTML ESCAPE
   */

  function escapeHTML(value) {

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


  /*
   * SAFE ATTRIBUTE ESCAPE
   */

  function escapeAttribute(value) {

    return String(
      value ?? ""
    )
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

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

      sendButton.innerHTML = `
        <span class="typing-dots">
          <i></i>
          <i></i>
          <i></i>
        </span>
      `;

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
}
