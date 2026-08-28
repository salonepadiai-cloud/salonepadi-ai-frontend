/* =========================================
   JOHNNY TEC OS
   CHAT MASTER CONTROLLER

   RESPONSIBILITY:
   - Coordinate Chat state
   - Coordinate Chat shell
   - Coordinate Sidebar
   - Coordinate Conversations
   - Coordinate Messages
   - Coordinate Composer
   - Coordinate optional features

   This controller keeps the UI state synchronized
   with the backend without requiring a page refresh.
   ========================================= */

import {
  authenticated,
  currentUser
} from "../auth.js";

import {
  api
} from "../api.js";

import {
  createChatState
} from "./chat/chat-state.js";

import {
  createChatShell
} from "./chat/chat-shell.js";

import {
  initializeSidebar
} from "./chat/sidebar.js";

import {
  initializeConversations,
  switchConversationData,
  loadConversations,
  createConversation
} from "./chat/conversations.js";

import {
  initializeMessages,
  appendMessage,
  renderMessages,
  clearMessages
} from "./chat/messages.js";

import {
  initializeComposer
} from "./chat/composer.js";

import {
  loadChatFeatures
} from "./chat/feature-loader.js";


let activeCleanup = null;


/* =========================================
   RENDER CHAT
   ========================================= */

export async function renderChat(container) {

  if (!container) {

    console.error(
      "Johnny Tec OS: Chat container was not found."
    );

    return;

  }


  /* =========================================
     AUTHENTICATION
     ========================================= */

  if (!authenticated()) {

    window.location.hash =
      "#/login";

    return;

  }


  /* =========================================
     CLEAN PREVIOUS INSTANCE
     ========================================= */

  if (
    typeof activeCleanup ===
    "function"
  ) {

    try {

      activeCleanup();

    } catch (error) {

      console.warn(
        "Johnny Tec OS: Previous chat cleanup failed:",
        error
      );

    }

    activeCleanup = null;

  }


  /* =========================================
     CURRENT USER
     ========================================= */

  const user =
    currentUser();

  const displayName =
    user?.user_metadata?.name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";


  /* =========================================
     CREATE STATE
     ========================================= */

  let state;

  try {

    state =
      createChatState();

  } catch (error) {

    console.error(
      "Johnny Tec OS: Chat state creation failed:",
      error
    );

    return;

  }


  if (!state) {

    console.error(
      "Johnny Tec OS: Chat state was not created."
    );

    return;

  }


  /* =========================================
     CREATE CHAT SHELL
     ========================================= */

  let elements;

  try {

    elements =
      createChatShell(
        container,
        {
          user,
          displayName
        }
      );

  } catch (error) {

    console.error(
      "Johnny Tec OS: Chat shell creation failed:",
      error
    );

    return;

  }


  if (!elements) {

    console.error(
      "Johnny Tec OS: Chat shell could not be created."
    );

    return;

  }


  /* =========================================
     RESOLVE MESSAGE CONTAINER
     =========================================

     IMPORTANT:
     The shell may expose the container
     under different property names.
     ========================================= */

  const messagesContainer =
    elements.messagesContainer ||
    elements.messageList ||
    elements.messages ||
    null;


  if (!messagesContainer) {

    console.error(
      "Johnny Tec OS: No messages container found."
    );

  }


  /* =========================================
     MODULE CLEANUPS
     ========================================= */

  let sidebarCleanup = null;

  let conversationsCleanup = null;

  let messagesCleanup = null;

  let composerCleanup = null;

  let featuresCleanup = null;


  /* =========================================
     MESSAGE RENDERING
     ========================================= */

  function addChatMessage(
    role,
    content,
    id = null
  ) {

    if (!messagesContainer) {

      console.error(
        "Johnny Tec OS: Cannot render message because messages container is missing."
      );

      return null;

    }


    if (
      content === null ||
      content === undefined ||
      String(content).trim() === ""
    ) {

      return null;

    }


    /*
     * Add to shared state first.
     */

    const message =
      state.addMessage(
        role,
        content,
        id
      );


    /*
     * Immediately render the message.
     */

    appendMessage(
      messagesContainer,
      message
    );


    return message;

  }


  /* =========================================
     CLEAR CHAT
     ========================================= */

  function clearChatMessages() {

    state.clearMessages();


    if (messagesContainer) {

      clearMessages(
        messagesContainer
      );

    }

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
      null;


    if (!status) {

      return;

    }


    status.textContent =
      String(message || "");


    status.classList.toggle(
      "error",
      Boolean(isError)
    );


    status.classList.toggle(
      "visible",
      Boolean(message)
    );

  }


  /* =========================================
     LOAD MESSAGES
     ========================================= */

  async function loadMessages(
    conversationId
  ) {

    if (!conversationId) {

      clearChatMessages();

      return [];

    }


    try {

      state.setLoading(
        true
      );

      state.setError(
        null
      );


      const data =
        await switchConversationData(
          api,
          conversationId
        );


      const serverMessages =
        Array.isArray(
          data?.messages
        )
          ? data.messages
          : [];


      /*
       * Normalize backend messages.
       */

      const normalizedMessages =
        serverMessages
          .map(
            message => ({

              id:
                message?.id ||
                null,

              role:
                message?.role ===
                "user"
                  ? "user"
                  : "assistant",

              content:
                String(
                  message?.content ??
                  message?.text ??
                  ""
                ),

              createdAt:
                message?.created_at ||
                message?.createdAt ||
                new Date().toISOString()

            })
          )
          .filter(
            message =>
              message.content.trim()
          );


      /*
       * Replace state with the server truth.
       */

      state.messages =
        normalizedMessages;


      /*
       * Render the complete conversation.
       */

      renderMessages(
        messagesContainer,
        state.messages
      );


      showStatus(
        ""
      );


      return state.messages;

    } catch (error) {

      console.error(
        "Johnny Tec OS: Unable to load messages:",
        error
      );


      state.setError(
        error
      );


      showStatus(
        error?.message ||
        "Unable to load conversation messages.",
        true
      );


      throw error;

    } finally {

      state.setLoading(
        false
      );

    }

  }


  /* =========================================
     START NEW CHAT
     ========================================= */

  async function startNewChat() {

    const conversation =
      await createConversation(
        api,
        "New Chat"
      );


    state.setConversation(
      conversation.id,
      conversation.title ||
      "New Chat"
    );


    clearChatMessages();


    /*
     * Refresh sidebar conversation list.
     */

    try {

      const conversations =
        await loadConversations(
          api
        );


      renderConversationList(
        conversations
      );

    } catch (error) {

      console.warn(
        "Johnny Tec OS: Unable to refresh conversation list:",
        error
      );

    }


    return conversation;

  }


  /* =========================================
     RENDER CONVERSATION LIST
     ========================================= */

  function renderConversationList(
    conversations = []
  ) {

    const list =
      elements.conversationList;


    if (!list) {

      return;

    }


    list.innerHTML =
      "";


    conversations.forEach(
      conversation => {

        if (!conversation?.id) {

          return;

        }


        const item =
          document.createElement(
            "button"
          );


        item.type =
          "button";


        item.className =
          "conversation-item";


        item.dataset.conversationId =
          conversation.id;


        item.textContent =
          conversation.displayTitle ||
          conversation.title ||
          "New Chat";


        list.appendChild(
          item
        );

      }
    );

  }


  /* =========================================
     CONVERSATION CHANGED
     ========================================= */

  async function onConversationChanged(
    change = {}
  ) {

    const {
      conversationId,
      userMessage
    } = change;


    if (!conversationId) {

      return;

    }


    /*
     * IMPORTANT:
     *
     * The Composer already added the user's
     * message through addChatMessage().
     *
     * Therefore we MUST NOT add it again here.
     *
     * This prevents duplicate messages.
     */


    /*
     * Refresh the conversation list only.
     *
     * Do NOT call loadMessages() here.
     *
     * Calling loadMessages immediately after
     * sending can replace the optimistic UI
     * while the backend response is still
     * settling.
     */

    try {

      const conversations =
        await loadConversations(
          api
        );


      renderConversationList(
        conversations
      );

    } catch (error) {

      console.warn(
        "Johnny Tec OS: Conversation list refresh failed:",
        error
      );

    }


    /*
     * Keep the current conversation title
     * useful after the first message.
     */

    if (
      userMessage &&
      state.conversationTitle ===
        "New Chat"
    ) {

      const title =
        String(
          userMessage
        )
          .replace(
            /\s+/g,
            " "
          )
          .trim()
          .slice(
            0,
            42
          );


      if (title) {

        state.setConversation(
          conversationId,
          title
        );

      }

    }

  }


  /* =========================================
     SIDEBAR
     ========================================= */

  try {

    sidebarCleanup =
      await initializeSidebar({

        elements,

        state,

        user,

        displayName

      });

  } catch (error) {

    console.error(
      "Johnny Tec OS: Sidebar initialization failed:",
      error
    );

  }


  /* =========================================
     MESSAGES
     ========================================= */

  /*
   * Initialize Messages BEFORE Conversations.
   *
   * This is important because Conversations
   * immediately loads the first conversation's
   * messages.
   */

  try {

    const result =
      await initializeMessages({

        elements,

        state,

        user,

        displayName

      });


    if (
      typeof result ===
      "function"
    ) {

      messagesCleanup =
        result;

    } else if (
      result &&
      typeof result.cleanup ===
        "function"
    ) {

      messagesCleanup =
        result.cleanup;

    }

  } catch (error) {

    console.error(
      "Johnny Tec OS: Message initialization failed:",
      error
    );

  }


  /* =========================================
     CONVERSATIONS
     ========================================= */

  try {

    conversationsCleanup =
      await initializeConversations({

        elements,

        state,

        user,

        displayName,

        api,

        actions: {

          renderConversationList,

          loadMessages,

          startNewChat,

          showStatus,

          closeSidebars() {

            /*
             * Support shell implementations
             * that expose a closeSidebars method.
             */

            if (
              typeof elements.closeSidebars ===
                "function"
            ) {

              elements.closeSidebars();

            }

          }

        }

      });

  } catch (error) {

    console.error(
      "Johnny Tec OS: Conversation initialization failed:",
      error
    );


    showStatus(
      error?.message ||
      "Unable to load conversations.",
      true
    );

  }


  /* =========================================
     COMPOSER
     ========================================= */

  try {

    composerCleanup =
      await initializeComposer({

        elements,

        state,

        user,

        displayName,

        api,

        actions: {

          /*
           * Composer uses this to immediately
           * render the user's message.
           */

          addMessage:
            addChatMessage,


          /*
           * Status display.
           */

          showStatus,


          /*
           * Called after backend successfully
           * returns the AI response.
           */

          onConversationChanged

        }

      });

  } catch (error) {

    console.error(
      "Johnny Tec OS: Composer initialization failed:",
      error
    );


    showStatus(
      error?.message ||
      "Composer could not initialize.",
      true
    );

  }


  /* =========================================
     OPTIONAL FEATURES
     ========================================= */

  try {

    featuresCleanup =
      await loadChatFeatures({

        elements,

        state,

        user,

        displayName,

        api

      });

  } catch (error) {

    console.warn(
      "Johnny Tec OS: Optional chat features failed:",
      error
    );

  }


  /* =========================================
     CLEANUP
     ========================================= */

  const cleanup = () => {

    const cleanups = [

      featuresCleanup,

      composerCleanup,

      messagesCleanup,

      conversationsCleanup,

      sidebarCleanup

    ];


    for (
      const moduleCleanup
      of cleanups
    ) {

      if (
        typeof moduleCleanup !==
        "function"
      ) {

        continue;

      }


      try {

        moduleCleanup();

      } catch (error) {

        console.warn(
          "Johnny Tec OS: Chat module cleanup failed:",
          error
        );

      }

    }


    /*
     * chat-state currently may not expose
     * destroy(), so only call it when it exists.
     */

    if (
      typeof state.destroy ===
      "function"
    ) {

      try {

        state.destroy();

      } catch (error) {

        console.warn(
          "Johnny Tec OS: Chat state cleanup failed:",
          error
        );

      }

    }


    if (
      activeCleanup ===
      cleanup
    ) {

      activeCleanup =
        null;

    }

  };


  activeCleanup =
    cleanup;


  /* =========================================
     CHAT READY
     ========================================= */

  return {

    state,

    elements,

    cleanup

  };
}
