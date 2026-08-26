/* =========================================
   SalonePadi AI
   Composer Module

   RESPONSIBILITY:
   This file owns the chat composer.

   It handles:
   - Textarea input
   - Enter / Shift+Enter
   - Textarea auto-resize
   - Send button
   - Sending state
   - Sending messages to the backend
   - Returning the AI response to the controller

   It does NOT:
   - Render messages
   - Manage conversations
   - Render sidebar
   - Format AI responses
   - Manage authentication
   - Manage chat state globally
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


  const onConversationChanged =
    actions.onConversationChanged;


  /* -----------------------------------------
     REQUIRED ELEMENTS
     ----------------------------------------- */

  if (!input || !form) {

    console.warn(
      "Composer could not initialize: required elements missing."
    );

    return () => {};

  }


  /* -----------------------------------------
     API
     ----------------------------------------- */

  /*
   * The API can be passed directly from chat.js.
   *
   * Keeping it injected makes this module easier
   * to test and prevents it from importing the
   * backend implementation unnecessarily.
   */

  const apiClient =
    api;


  /* -----------------------------------------
     RESIZE TEXTAREA
     ----------------------------------------- */

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


  /* -----------------------------------------
     SET SENDING STATE
     ----------------------------------------- */

  function setSending(
    sending
  ) {

    const value =
      Boolean(sending);


    if (state) {
      state.isSending =
        value;
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


  /* -----------------------------------------
     SEND MESSAGE
     ----------------------------------------- */

  async function sendMessage() {

    /*
     * Do not send while another message is
     * already being processed.
     */

    if (
      state?.isSending
    ) {
      return;
    }


    const message =
      input.value.trim();


    if (!message) {
      return;
    }


    /*
     * A conversation is required.
     */

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


    /*
     * API is required for backend chat.
     */

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


    /*
     * Clear the composer immediately so the
     * interface feels responsive.
     */

    input.value =
      "";

    input.style.height =
      "auto";


    /*
     * Render the user's message immediately.
     *
     * The actual rendering remains owned by
     * messages.js through the injected action.
     */

    if (
      typeof addMessage ===
      "function"
    ) {

      addMessage(
        "user",
        message
      );

    }


    setSending(
      true
    );


    if (
      typeof showStatus ===
      "function"
    ) {

      showStatus(
        "SalonePadi AI is thinking..."
      );

    }


    try {

      /*
       * Backend contract.
       *
       * DO NOT change this endpoint here.
       */

      const data =
        await apiClient.post(
          `/api/chat/conversations/${encodeURIComponent(
            conversationId
          )}/messages`,
          {
            message
          }
        );


      const assistantContent =
        data?.message?.content ||
        data?.content ||
        "";


      if (!assistantContent) {

        throw new Error(
          "SalonePadi AI did not return a response."
        );

      }


      /*
       * Send the AI response back to the
       * message layer.
       */

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
       * Notify the controller that a message
       * has been successfully sent.
       *
       * The controller can use this to update
       * conversation titles and refresh chats.
       */

      if (
        typeof onConversationChanged ===
        "function"
      ) {

        await onConversationChanged({
          userMessage: message,
          assistantMessage:
            assistantContent,
          conversationId
        });

      }

      return {
        userMessage:
          message,

        assistantMessage:
          assistantContent,

        conversationId
      };

    } catch (error) {

      console.error(
        "Send message error:",
        error
      );


      if (
        typeof showStatus ===
        "function"
      ) {

        showStatus(
          error?.message ||
          "Unable to generate AI response.",
          true
        );

      }


      throw error;

    } finally {

      setSending(
        false
      );


      input.focus();

    }

  }


  /* -----------------------------------------
     FORM SUBMIT
     ----------------------------------------- */

  const handleSubmit =
    async event => {

      event.preventDefault();


      try {

        await sendMessage();

      } catch {
        /*
         * sendMessage already reports the
         * error to the UI.
         */
      }

    };


  /* -----------------------------------------
     KEYBOARD INPUT
     ----------------------------------------- */

  const handleKeyDown =
    event => {

      /*
       * Enter sends.
       *
       * Shift + Enter creates a new line.
       */

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        form.requestSubmit();

      }

    };


  /* -----------------------------------------
     INPUT EVENT
     ----------------------------------------- */

  const handleInput =
    () => {

      resizeInput();

    };


  /* -----------------------------------------
     ATTACH EVENTS
     ----------------------------------------- */

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


  /*
   * Set the correct initial textarea height.
   */

  resizeInput();


  /* -----------------------------------------
     RETURN CLEANUP
     ----------------------------------------- */

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
     * Restore the composer to an idle state.
     */

    if (state) {
      state.isSending =
        false;
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
   BACKWARD-COMPATIBILITY ALIAS
   =========================================

   Some older feature-loader code may still call:

       init(context)

   Keep the alias temporarily so the module does
   not break while we finish separating Chat J's.

   Once feature-loader.js is updated, this can be
   removed.
   ========================================= */

export async function init(
  context = {}
) {

  return initializeComposer(
    context
  );

  }
