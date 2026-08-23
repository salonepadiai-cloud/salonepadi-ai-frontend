import {
  authenticated,
  currentUser,
  logout
} from "../auth.js";

import { api } from "../api.js";

let conversationId = null;

export async function renderChat(container) {
  /*
   * Make sure a token and user exist locally.
   */
  if (!authenticated()) {
    window.location.hash = "#/login";
    return;
  }

  const user = currentUser();

  container.innerHTML = `
    <main class="chat-page">

      <header class="chat-header">

        <div class="chat-brand">
          <div class="chat-logo">🦁</div>

          <div>
            <h1>SalonePadi AI</h1>
            <span>Your personal AI padi</span>
          </div>
        </div>

        <div class="chat-user">

          <span>
            ${escapeHTML(
              user?.user_metadata?.name ||
              user?.name ||
              user?.email ||
              "User"
            )}
          </span>

          <button
            id="logoutButton"
            class="logout-button"
            type="button"
          >
            Log Out
          </button>

        </div>

      </header>

      <section class="chat-container">

        <div
          id="messages"
          class="chat-messages"
        ></div>

        <div
          id="chatStatus"
          class="chat-status"
        ></div>

        <form
          id="chatForm"
          class="chat-form"
        >

          <input
            id="messageInput"
            type="text"
            placeholder="Talk to your AI padi..."
            autocomplete="off"
            required
          >

          <button
            id="sendButton"
            type="submit"
          >
            Send
          </button>

        </form>

      </section>

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

  const logoutButton =
    document.getElementById("logoutButton");

  /*
   * Logout
   */
  logoutButton.addEventListener(
    "click",
    async () => {
      logoutButton.disabled = true;
      logoutButton.textContent =
        "Logging out...";

      try {
        await logout();
      } finally {
        window.location.hash =
          "#/login";
      }
    }
  );

  /*
   * Verify the token with the backend
   * before creating the conversation.
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

    /*
     * A 401 means the token is genuinely
     * invalid or expired.
     */
    if (
      error.message?.toLowerCase().includes(
        "session"
      ) ||
      error.message?.toLowerCase().includes(
        "authentication"
      ) ||
      error.message?.toLowerCase().includes(
        "invalid"
      )
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

  /*
   * Send message
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
   * Create conversation
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
   * Load messages
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
   * Display message
   */
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
        <strong>
          SalonePadi AI
        </strong>

        <p>
          ${escapeHTML(content)}
        </p>
      `;
    } else {
      element.innerHTML = `
        <p>
          ${escapeHTML(content)}
        </p>
      `;
    }

    messages.appendChild(
      element
    );

    messages.scrollTop =
      messages.scrollHeight;
  }

  /*
   * Sending state
   */
  function setSending(
    sending
  ) {
    input.disabled =
      sending;

    sendButton.disabled =
      sending;

    sendButton.textContent =
      sending
        ? "Thinking..."
        : "Send";
  }

  /*
   * Status message
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
   * Escape HTML
   */
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
