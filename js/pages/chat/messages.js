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

   This module does NOT:
   - Call the backend
   - Manage authentication
   - Manage conversations
   - Manage composer/input
   ========================================= */


/* =========================================
   INITIALIZE MESSAGES
   ========================================= */

export function initializeMessages(context = {}) {

  const {
    elements = {},
    state = null,
    user = null,
    displayName = "User"
  } = context;


  /*
   * Find the messages container.
   *
   * Different versions of chat-shell may expose
   * the container under different names.
   */

  const messagesContainer =
    elements.messagesContainer ||
    elements.messageList ||
    elements.messages ||
    null;


  if (!messagesContainer) {

    console.error(
      "Johnny Tec OS: Messages container was not found."
    );

    return {
      cleanup: () => {},
      addMessage: () => {},
      showStatus: () => {},
      clearMessages: () => {},
      renderMessages: () => {}
    };

  }


  /* =========================================
     GET CURRENT STATE MESSAGES
     ========================================= */

  function getStateMessages() {

    if (
      !state ||
      !Array.isArray(state.messages)
    ) {

      return [];

    }

    return state.messages;

  }


  /* =========================================
     ADD MESSAGE
     ========================================= */

  function addMessage(
    role,
    content,
    id = null
  ) {

    /*
     * Ignore empty messages.
     */

    if (
      content === null ||
      content === undefined ||
      String(content).trim() === ""
    ) {

      return null;

    }


    /*
     * Add the message to chat state.
     *
     * This is important because the Composer
     * and the UI must share the same message state.
     */

    let message;


    if (
      state &&
      typeof state.addMessage === "function"
    ) {

      message =
        state.addMessage(
          role,
          content,
          id
        );

    } else {

      message = {

        id:
          id ||
          `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`,

        role,

        content:
          String(content),

        createdAt:
          new Date().toISOString()

      };

    }


    /*
     * Render immediately.
     */

    appendMessage(
      messagesContainer,
      message
    );


    return message;

  }


  /* =========================================
     RENDER EXISTING STATE
     ========================================= */

  renderMessages(
    messagesContainer,
    getStateMessages()
  );


  /* =========================================
     SHOW STATUS
     ========================================= */

  function showStatus(
    message = "",
    error = false
  ) {

    /*
     * Try the shell's status element first.
     */

    const status =
      elements.chatStatus ||
      elements.status ||
      null;


    if (!status) {
      return;
    }


    status.textContent =
      String(message || "");


    status.classList.toggle(
      "error",
      Boolean(error)
    );


    status.classList.toggle(
      "visible",
      Boolean(message)
    );

  }


  /* =========================================
     CLEAR MESSAGES
     ========================================= */

  function clearMessages() {

    /*
     * Clear state first.
     */

    if (
      state &&
      typeof state.clearMessages ===
        "function"
    ) {

      state.clearMessages();

    }


    /*
     * Then clear UI.
     */

    messagesContainer.innerHTML =
      "";

  }


  /* =========================================
     CLEANUP
     ========================================= */

  function cleanup() {

    /*
     * Nothing persistent is attached here
     * currently, but keeping cleanup makes
     * the module compatible with the master
     * controller.
     */

  }


  /* =========================================
     PUBLIC MESSAGE API
     ========================================= */

  return {

    cleanup,

    addMessage,

    showStatus,

    clearMessages,

    renderMessages: (
      messages = []
    ) => {

      renderMessages(
        messagesContainer,
        messages
      );

    },

    appendMessage: (
      message
    ) => {

      return appendMessage(
        messagesContainer,
        message
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
    return;
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
    message.content ||
    message.text ||
    "";


  if (
    String(content).trim() === ""
  ) {

    return null;

  }


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


  /*
   * Avatar
   */

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


  /*
   * Bubble
   */

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


  /*
   * Message text
   */

  const text =
    document.createElement(
      "div"
    );


  text.className =
    "message-text";


  text.textContent =
    String(content);


  /*
   * Build message
   */

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


  /*
   * Always keep latest message visible.
   */

  scrollToBottom(
    container
  );


  return row;

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


/* =========================================
   DEFAULT EXPORT
   ========================================= */

export default {
  initializeMessages,
  renderMessages,
  appendMessage,
  scrollToBottom
};
