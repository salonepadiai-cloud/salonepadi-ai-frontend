/* =========================================
   JOHNNY TEC OS — MESSAGE MODULE
   =========================================

   RESPONSIBILITY:
   - Initialize message UI
   - Render messages
   - Append messages
   - Clear messages
   - Show chat status
   - Scroll chat to bottom
   - Expose message actions to Chat Controller

   This module does NOT:
   - Call the backend
   - Manage authentication
   - Manage conversations
   - Send messages
   ========================================= */


/* =========================================
   INITIALIZE MESSAGES
   ========================================= */

export function initializeMessages(
  context = {}
) {

  const {
    elements = {},
    state = null,
    messagesContainer,
    getMessages
  } = context;


  /*
   * Support the new Chat Shell interface.
   *
   * Also keep compatibility with the older
   * direct messagesContainer interface.
   */

  const container =
    elements.messages ||
    elements.chatMessages ||
    elements.messagesContainer ||
    messagesContainer;


  if (!container) {

    console.warn(
      "Johnny Tec OS: messages container not found."
    );

    return {
      cleanup() {},
      addMessage() {},
      showStatus() {}
    };

  }


  /* =========================================
     GET CURRENT MESSAGES
     ========================================= */

  function readMessages() {

    /*
     * Prefer supplied getter.
     */

    if (
      typeof getMessages === "function"
    ) {

      return getMessages() || [];

    }


    /*
     * Try Chat State.
     */

    if (
      state &&
      typeof state.getMessages === "function"
    ) {

      return state.getMessages() || [];

    }


    /*
     * Try state.messages.
     */

    if (
      state &&
      Array.isArray(state.messages)
    ) {

      return state.messages;

    }


    return [];

  }


  /* =========================================
     RENDER EXISTING MESSAGES
     ========================================= */

  renderMessages(
    container,
    readMessages()
  );


  /* =========================================
     ADD MESSAGE
     ========================================= */

  function addMessage(
    role,
    content
  ) {

    if (!content) {
      return null;
    }


    const message = {

      role:
        role === "user"
          ? "user"
          : "assistant",

      content:
        String(content)

    };


    /*
     * Keep state synchronized when the
     * state module exposes addMessage().
     */

    if (
      state &&
      typeof state.addMessage ===
      "function"
    ) {

      try {

        state.addMessage(
          message
        );

      } catch (error) {

        console.warn(
          "Johnny Tec OS: state.addMessage() failed:",
          error
        );

      }

    }


    return appendMessage(
      container,
      message
    );

  }


  /* =========================================
     SHOW STATUS
     ========================================= */

  function showStatus(
    message = "",
    isError = false
  ) {

    const status =
      elements.chatStatus ||
      elements.status ||
      document.getElementById(
        "chatStatus"
      );


    if (!status) {
      return;
    }


    status.textContent =
      String(message || "");


    status.classList.toggle(
      "chat-error",
      Boolean(isError)
    );


    /*
     * Empty status after successful
     * operations.
     */

    if (!message) {

      status.classList.remove(
        "chat-error"
      );

    }

  }


  /* =========================================
     CLEANUP
     ========================================= */

  function cleanup() {

    /*
     * Do not destroy the container here.
     *
     * The Chat Controller owns the shell.
     */

  }


  /* =========================================
     PUBLIC MODULE API
     ========================================= */

  return {

    cleanup,

    addMessage,

    showStatus,

    renderMessages:
      () => {

        renderMessages(
          container,
          readMessages()
        );

      },

    clearMessages:
      () => {

        clearMessages(
          container
        );

      },

    scrollToBottom:
      () => {

        scrollToBottom(
          container
        );

      }

  };

}


/* =========================================
   RENDER ALL MESSAGES
   ========================================= */

export function renderMessages(
  container,
  messages = []
) {

  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (!Array.isArray(messages)) {

    messages = [];

  }


  messages.forEach(
    message => {

      appendMessage(
        container,
        message
      );

    }
  );


  scrollToBottom(
    container
  );

}


/* =========================================
   APPEND ONE MESSAGE
   ========================================= */

export function appendMessage(
  container,
  message = {}
) {

  if (!container) {
    return null;
  }


  const role =
    message.role ||
    "assistant";


  const content =
    message.content ??
    message.text ??
    "";


  const row =
    document.createElement(
      "div"
    );


  row.className =
    `message-row ${
      role === "user"
        ? "message-row-user"
        : "message-row-ai"
    }`;


  /* =========================================
     AVATAR
     ========================================= */

  const avatar =
    document.createElement(
      "div"
    );


  avatar.className =
    "message-avatar";


  avatar.textContent =
    role === "user"
      ? "YOU"
      : "🦁";


  /* =========================================
     BUBBLE
     ========================================= */

  const bubble =
    document.createElement(
      "div"
    );


  bubble.className =
    `message-bubble ${
      role === "user"
        ? "user-message"
        : "ai-message"
    }`;


  /* =========================================
     MESSAGE TEXT
     ========================================= */

  const text =
    document.createElement(
      "div"
    );


  text.className =
    "message-text";


  text.textContent =
    String(content);


  /* =========================================
     BUILD
     ========================================= */

  bubble.appendChild(
    text
  );


  row.appendChild(
    avatar
  );


  row.appendChild(
    bubble
  );


  container.appendChild(
    row
  );


  scrollToBottom(
    container
  );


  return row;

}


/* =========================================
   CLEAR MESSAGES
   ========================================= */

export function clearMessages(
  container
) {

  if (!container) {
    return;
  }


  container.innerHTML =
    "";

}


/* =========================================
   SCROLL TO BOTTOM
   ========================================= */

export function scrollToBottom(
  container
) {

  if (!container) {
    return;
  }


  requestAnimationFrame(
    () => {

      container.scrollTop =
        container.scrollHeight;

    }
  );
}
