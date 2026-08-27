/*
|--------------------------------------------------------------------------
| JOHNNY TEC OS — CHAT STATE
|--------------------------------------------------------------------------
|
| RESPONSIBILITY:
| This module owns the in-memory state of the active chat.
|
| It does NOT:
| - Call the backend
| - Render UI
| - Manage authentication
| - Send messages
|
| It provides a shared state contract for:
| - Chat controller
| - Conversations
| - Messages
| - Composer
| - Sidebar
|
|--------------------------------------------------------------------------
*/

export function createChatState() {

  /*
  |--------------------------------------------------------------------------
  | PRIVATE STATE
  |--------------------------------------------------------------------------
  */

  const state = {

    /*
    |--------------------------------------------------------------------------
    | ACTIVE CONVERSATION
    |--------------------------------------------------------------------------
    */

    conversationId: null,

    conversationTitle: "New Chat",


    /*
    |--------------------------------------------------------------------------
    | MESSAGES
    |--------------------------------------------------------------------------
    */

    messages: [],


    /*
    |--------------------------------------------------------------------------
    | LOADING / SENDING
    |--------------------------------------------------------------------------
    */

    sending: false,

    loading: false,

    error: null,


    /*
    |--------------------------------------------------------------------------
    | AUDIO
    |--------------------------------------------------------------------------
    */

    audioPlaying: false,

    audioMessageId: null,


    /*
    |--------------------------------------------------------------------------
    | CONVERSATION
    |--------------------------------------------------------------------------
    */

    setConversation(
      id,
      title = "New Chat"
    ) {

      this.conversationId =
        id || null;

      this.conversationTitle =
        title || "New Chat";

    },


    /*
    |--------------------------------------------------------------------------
    | SET CONVERSATION TITLE
    |--------------------------------------------------------------------------
    */

    setConversationTitle(
      title = "New Chat"
    ) {

      this.conversationTitle =
        title || "New Chat";

    },


    /*
    |--------------------------------------------------------------------------
    | ADD MESSAGE
    |--------------------------------------------------------------------------
    |
    | Supports BOTH:
    |
    | addMessage("user", "Hello")
    |
    | and:
    |
    | addMessage({
    |   role: "user",
    |   content: "Hello"
    | })
    |
    |--------------------------------------------------------------------------
    */

    addMessage(
      roleOrMessage,
      content = "",
      id = null
    ) {

      let message;


      /*
       * Object form.
       */

      if (
        roleOrMessage &&
        typeof roleOrMessage ===
          "object"
      ) {

        message = {

          id:
            roleOrMessage.id ||
            id ||
            createMessageId(),

          role:
            roleOrMessage.role ||
            "assistant",

          content:
            String(
              roleOrMessage.content ??
              roleOrMessage.text ??
              ""
            ),

          createdAt:
            roleOrMessage.createdAt ||
            new Date().toISOString()

        };

      }


      /*
       * Standard role/content form.
       */

      else {

        message = {

          id:
            id ||
            createMessageId(),

          role:
            roleOrMessage ||
            "assistant",

          content:
            String(
              content ?? ""
            ),

          createdAt:
            new Date().toISOString()

        };

      }


      this.messages.push(
        message
      );


      return message;

    },


    /*
    |--------------------------------------------------------------------------
    | SET / REPLACE MESSAGES
    |--------------------------------------------------------------------------
    */

    setMessages(
      messages = []
    ) {

      this.messages =
        Array.isArray(messages)
          ? messages.map(
              normalizeMessage
            )
          : [];

      return this.messages;

    },


    /*
    |--------------------------------------------------------------------------
    | GET MESSAGES
    |--------------------------------------------------------------------------
    */

    getMessages() {

      return this.messages;

    },


    /*
    |--------------------------------------------------------------------------
    | CLEAR MESSAGES
    |--------------------------------------------------------------------------
    */

    clearMessages() {

      this.messages = [];

    },


    /*
    |--------------------------------------------------------------------------
    | SENDING STATE
    |--------------------------------------------------------------------------
    */

    setSending(
      value
    ) {

      this.sending =
        Boolean(value);

    },


    /*
    |--------------------------------------------------------------------------
    | LOADING STATE
    |--------------------------------------------------------------------------
    */

    setLoading(
      value
    ) {

      this.loading =
        Boolean(value);

    },


    /*
    |--------------------------------------------------------------------------
    | ERROR STATE
    |--------------------------------------------------------------------------
    */

    setError(
      error
    ) {

      this.error =
        error
          ? String(
              error?.message ||
              error
            )
          : null;

    },


    /*
    |--------------------------------------------------------------------------
    | AUDIO STATE
    |--------------------------------------------------------------------------
    */

    setAudioPlaying(
      messageId = null
    ) {

      this.audioPlaying =
        Boolean(messageId);

      this.audioMessageId =
        messageId || null;

    },


    /*
    |--------------------------------------------------------------------------
    | RESET
    |--------------------------------------------------------------------------
    */

    reset() {

      this.conversationId =
        null;

      this.conversationTitle =
        "New Chat";

      this.messages =
        [];

      this.sending =
        false;

      this.loading =
        false;

      this.error =
        null;

      this.audioPlaying =
        false;

      this.audioMessageId =
        null;

    },


    /*
    |--------------------------------------------------------------------------
    | DESTROY
    |--------------------------------------------------------------------------
    |
    | chat.js calls state.destroy()
    | during cleanup.
    |
    | Keep this safe and predictable.
    |--------------------------------------------------------------------------
    */

    destroy() {

      this.reset();

    }

  };


  /*
  |--------------------------------------------------------------------------
  | BACKWARD COMPATIBILITY
  |--------------------------------------------------------------------------
  |
  | Some existing modules use:
  |
  | state.isSending
  |
  | while the main state property is:
  |
  | state.sending
  |
  | Keep both synchronized.
  |--------------------------------------------------------------------------
  */

  Object.defineProperty(
    state,
    "isSending",
    {

      enumerable: true,

      configurable: true,

      get() {

        return this.sending;

      },

      set(value) {

        this.sending =
          Boolean(value);

      }

    }
  );


  return state;

}


/*
|--------------------------------------------------------------------------
| CREATE MESSAGE ID
|--------------------------------------------------------------------------
*/

function createMessageId() {

  return (
    `${Date.now()}-` +
    `${Math.random()
      .toString(36)
      .slice(2)}`
  );

}


/*
|--------------------------------------------------------------------------
| NORMALIZE MESSAGE
|--------------------------------------------------------------------------
*/

function normalizeMessage(
  message = {}
) {

  return {

    id:
      message.id ||
      createMessageId(),

    role:
      message.role ||
      "assistant",

    content:
      String(
        message.content ??
        message.text ??
        ""
      ),

    createdAt:
      message.createdAt ||
      new Date().toISOString()

  };

}


/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
*/

export default createChatState;
