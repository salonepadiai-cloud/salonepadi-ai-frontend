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
   * Keep these available for compatibility
   * with different chat-shell versions.
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

      addMessage: () => null,

      showStatus: () => {},

      clearMessages: () => {},

      renderMessages: () => {},

      appendMessage: () => null

    };

  }


  /* =========================================
     GET STATE MESSAGES
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

    if (
      content === null ||
      content === undefined ||
      String(content).trim() === ""
    ) {

      return null;

    }


    let message;


    /*
     * Prefer the shared chat state.
     */

    if (
      state &&
      typeof state.addMessage ===
        "function"
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

        role:
          role || "assistant",

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
     INITIAL RENDER
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
     CLEAR MESSAGE UI + STATE
     ========================================= */

  function clearMessagesLocal() {

    /*
     * Clear shared state.
     */

    if (
      state &&
      typeof state.clearMessages ===
        "function"
    ) {

      state.clearMessages();

    }


    /*
     * Clear rendered messages.
     */

    clearMessages(
      messagesContainer
    );

  }


  /* =========================================
     CLEANUP
     ========================================= */

  function cleanup() {

    /*
     * No persistent event listeners are owned
     * by this module at the moment.
     */

  }


  /* =========================================
     PUBLIC MESSAGE API
     ========================================= */

  return {

    cleanup,

    addMessage,

    showStatus,

    clearMessages:
      clearMessagesLocal,

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


  /* =========================================
     MESSAGE ROW
     ========================================= */

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
     MESSAGE BUBBLE
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
     BUILD MESSAGE
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


  /* =========================================
     KEEP LATEST MESSAGE VISIBLE
     ========================================= */

  scrollToBottom(
    container
  );


  return row;

}


/* =========================================
   CLEAR MESSAGES — NAMED EXPORT
   =========================================

   IMPORTANT:
   This MUST remain a top-level named export.

   Other modules may use:

       import {
         clearMessages
       } from "./chat/messages.js";
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


/* =========================================
   DEFAULT EXPORT
   ========================================= */

export default {

  initializeMessages,

  renderMessages,

  appendMessage,

  clearMessages,

  scrollToBottom

};
