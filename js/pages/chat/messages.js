/* =========================================
   SALONEPADI AI — MESSAGE MODULE
   =========================================

   RESPONSIBILITY:
   - Initialize message UI
   - Render messages
   - Append messages
   - Clear messages
   - Scroll chat to bottom

   This module does NOT:
   - Call the backend
   - Manage authentication
   - Manage conversations
   - Manage chat state
   ========================================= */


/* =========================================
   INITIALIZE MESSAGES
   ========================================= */

export function initializeMessages(context = {}) {

  const {
    messagesContainer,
    getMessages
  } = context;


  if (!messagesContainer) {
    console.warn(
      "SalonePadi AI: messages container not found."
    );

    return;
  }


  /*
  |--------------------------------------------------------------------------
  | RENDER EXISTING MESSAGES
  |--------------------------------------------------------------------------
  */

  if (typeof getMessages === "function") {

    const messages =
      getMessages() || [];

    renderMessages(
      messagesContainer,
      messages
    );

  }

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


  container.innerHTML = "";


  messages.forEach(
    (message) => {

      appendMessage(
        container,
        message
      );

    }
  );


  scrollToBottom(container);

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
    message.role || "assistant";


  const content =
    message.content ||
    message.text ||
    "";


  const row =
    document.createElement("div");


  row.className =
    `message-row ${
      role === "user"
        ? "message-row-user"
        : "message-row-ai"
    }`;


  const avatar =
    document.createElement("div");


  avatar.className =
    "message-avatar";


  avatar.textContent =
    role === "user"
      ? "YOU"
      : "🦁";


  const bubble =
    document.createElement("div");


  bubble.className =
    `message-bubble ${
      role === "user"
        ? "user-message"
        : "ai-message"
    }`;


  const text =
    document.createElement("div");


  text.className =
    "message-text";


  text.textContent =
    String(content);


  bubble.appendChild(text);

  row.appendChild(avatar);

  row.appendChild(bubble);

  container.appendChild(row);


  scrollToBottom(container);


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


  container.innerHTML = "";

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
