/* =========================================
   JOHNNY TEC OS — COMPOSER MODULE
   =========================================

   RESPONSIBILITY:
   - Textarea input
   - Enter / Shift+Enter
   - Textarea auto-resize
   - Send button
   - Sending state
   - Sending messages to the backend
   - Keeping message UI synchronized

   This module does NOT:
   - Manage authentication
   - Manage conversations
   - Own message HTML
   - Implement backend chat logic
   ========================================= */


/* =========================================
   INITIALIZE COMPOSER
   ========================================= */

export async function initializeComposer(
  context = {}
) {

  const {
    elements = {},
    state = null,
    api = null,
    actions = {}
  } = context;


  const input =
    elements.messageInput;


  const form =
    elements.chatForm;


  const sendButton =
    elements.sendButton;


  const showStatus =
    actions.showStatus;


  const addMessage =
    actions.addMessage;


  const renderMessages =
    actions.renderMessages;


  const onConversationChanged =
    actions.onConversationChanged;


  /* =========================================
     REQUIRED ELEMENTS
     ========================================= */

  if (!input || !form) {

    console.warn(
      "Johnny Tec OS: Composer could not initialize. Required elements are missing."
    );

    return () => {};

  }


  /* =========================================
     API
     ========================================= */

  const apiClient =
    api;


  /* =========================================
     RESIZE INPUT
     ========================================= */

  function resizeInput() {

    input.style.height =
      "auto";


    const maxHeight =
      180;


    input.style.height =
      `${Math.min(
        input.scrollHeight,
        maxHeight
      )}px`;

  }


  /* =========================================
     GET SENDING STATE
     ========================================= */

  function isSending() {

    if (!state) {
      return false;
    }


    /*
     * The official chat-state property is:
     *
     *     state.sending
     *
     * Keep isSending as a compatibility
     * fallback for older modules.
     */

    return Boolean(
      state.sending ||
      state.isSending
    );

  }


  /* =========================================
     SET SENDING STATE
     ========================================= */

  function setSending(
    sending
  ) {

    const value =
      Boolean(sending);


    if (state) {

      /*
       * Use the official state method
       * when available.
       */

      if (
        typeof state.setSending ===
        "function"
      ) {

        state.setSending(
          value
        );

      } else {

        /*
         * Compatibility fallback.
         */

        state.sending =
          value;

        state.isSending =
          value;

      }

    }


    if (sendButton) {

      sendButton.disabled =
        value;


      if (value) {

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


    input.disabled =
      value;

  }


  /* =========================================
     RENDER STATE MESSAGES
     ========================================= */

  function syncMessageUI() {

    if (
      typeof renderMessages !==
      "function"
    ) {

      return;

    }


    if (
      !state ||
      !Array.isArray(
        state.messages
      )
    ) {

      return;

    }


    /*
     * Re-render from the shared state.
     *
     * This prevents another module from
     * accidentally leaving the UI empty while
     * the message still exists in state.
     */

    renderMessages(
      state.messages
    );

  }


  /* =========================================
     SEND MESSAGE
     ========================================= */

  async function sendMessage() {

    /*
     * Never allow two requests at once.
     */

    if (
      isSending()
    ) {

      return;

    }


    const message =
      String(
        input.value || ""
      ).trim();


    if (!message) {
      return;
    }


    /* =========================================
       CONVERSATION CHECK
       ========================================= */

    const conversationId =
      state?.conversationId;


    if (!conversationId) {

      if (
        typeof showStatus ===
        "function"
      ) {

        showStatus(
          "No active conversation.",
          true
        );

      }

      return;

    }


    /* =========================================
       API CHECK
       ========================================= */

    if (
      !apiClient ||
      typeof apiClient.post !==
        "function"
    ) {

      if (
        typeof showStatus ===
        "function"
      ) {

        showStatus(
          "Chat API is unavailable.",
          true
        );

      }

      return;

    }


    /* =========================================
       LOCK COMPOSER
       ========================================= */

    setSending(
      true
    );


    /*
     * Clear the input only after validation
     * and after the request has been locked.
     */

    input.value =
      "";

    input.style.height =
      "auto";


    /* =========================================
       SHOW USER MESSAGE
       ========================================= */

    let userMessage = null;


    try {

      if (
        typeof addMessage ===
        "function"
      ) {

        userMessage =
          addMessage(
            "user",
            message
          );

      }


      /*
       * Immediately synchronize the UI from
       * state as an extra safety layer.
       */

      syncMessageUI();


    } catch (error) {

      console.error(
        "Johnny Tec OS: Failed to render user message:",
        error
      );


      /*
       * Restore the user's text if the UI
       * layer failed.
       */

      input.value =
        message;


      throw error;

    }


    /* =========================================
       STATUS
       ========================================= */

    if (
      typeof showStatus ===
      "function"
    ) {

      showStatus(
        "Johnny Tec OS is thinking..."
      );

    }


    /* =========================================
       BACKEND REQUEST
       ========================================= */

    try {

      const data =
        await apiClient.post(
          `/api/chat/conversations/${encodeURIComponent(
            conversationId
          )}/messages`,
          {
            message
          }
        );


      /* =====================================
         EXTRACT AI RESPONSE
         ===================================== */

      const assistantContent =
        data?.message?.content ||
        data?.content ||
        data?.reply ||
        data?.response ||
        "";


      if (
        !String(
          assistantContent
        ).trim()
      ) {

        throw new Error(
          "Johnny Tec OS did not return an AI response."
        );

      }


      /* =====================================
         ADD AI RESPONSE
         ===================================== */

      if (
        typeof addMessage ===
        "function"
      ) {

        addMessage(
          "assistant",
          assistantContent
        );

      }


      /*
       * Synchronize the complete conversation
       * from shared state.
       */

      syncMessageUI();


      /* =====================================
         CONVERSATION UPDATE
         ===================================== */

      if (
        typeof onConversationChanged ===
        "function"
      ) {

        await onConversationChanged({

          userMessage:
            message,

          assistantMessage:
            assistantContent,

          conversationId

        });

      }


      /* =====================================
         CLEAR STATUS
         ===================================== */

      if (
        typeof showStatus ===
        "function"
      ) {

        showStatus(
          ""
        );

      }


      return {

        userMessage:
          message,

        assistantMessage:
          assistantContent,

        conversationId,

        userMessageObject:
          userMessage

      };


    } catch (error) {

      console.error(
        "Johnny Tec OS: Send message error:",
        error
      );


      /*
       * Keep the already-created user message
       * in the chat state.
       *
       * Do NOT erase it.
       */

      if (
        typeof showStatus ===
        "function"
      ) {

        showStatus(
          error?.message ||
          "Unable to generate an AI response.",
          true
        );

      }


      /*
       * Re-sync the UI so the user's message
       * does not disappear after an error.
       */

      syncMessageUI();


      throw error;


    } finally {

      /* =====================================
         ALWAYS UNLOCK COMPOSER
         ===================================== */

      setSending(
        false
      );


      /*
       * Re-sync one final time.
       */

      syncMessageUI();


      /*
       * Return focus to the input.
       */

      try {

        input.focus();

      } catch (_) {}

    }

  }


  /* =========================================
     FORM SUBMIT
     ========================================= */

  const handleSubmit =
    async event => {

      event.preventDefault();


      try {

        await sendMessage();

      } catch {

        /*
         * sendMessage already handles
         * the visible error.
         */

      }

    };


  /* =========================================
     KEYBOARD INPUT
     ========================================= */

  const handleKeyDown =
    event => {

      /*
       * Enter = send.
       *
       * Shift + Enter = new line.
       */

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();


        /*
         * Avoid requestSubmit() compatibility
         * problems on older mobile browsers.
         */

        if (
          typeof form.requestSubmit ===
          "function"
        ) {

          form.requestSubmit();

        } else {

          handleSubmit(
            new Event(
              "submit",
              {
                bubbles: true,
                cancelable: true
              }
            )
          );

        }

      }

    };


  /* =========================================
     INPUT EVENT
     ========================================= */

  const handleInput =
    () => {

      resizeInput();

    };


  /* =========================================
     ATTACH EVENTS
     ========================================= */

  input.addEventListener(
    "input",
    handleInput
  );


  input.addEventListener(
    "keydown",
    handleKeyDown
  );


  form.addEventListener(
    "submit",
    handleSubmit
  );


  /* =========================================
     INITIAL STATE
     ========================================= */

  resizeInput();


  /* =========================================
     CLEANUP
     ========================================= */

  return () => {

    input.removeEventListener(
      "input",
      handleInput
    );


    input.removeEventListener(
      "keydown",
      handleKeyDown
    );


    form.removeEventListener(
      "submit",
      handleSubmit
    );


    /*
     * Restore idle state.
     */

    if (state) {

      if (
        typeof state.setSending ===
        "function"
      ) {

        state.setSending(
          false
        );

      } else {

        state.sending =
          false;

        state.isSending =
          false;

      }

    }


    input.disabled =
      false;


    if (sendButton) {

      sendButton.disabled =
        false;

      sendButton.textContent =
        "↑";

    }

  };

}


/* =========================================
   BACKWARD COMPATIBILITY
   ========================================= */

export async function init(
  context = {}
) {

  return initializeComposer(
    context
  );

  }
