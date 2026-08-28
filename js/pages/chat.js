/* =========================================
   JOHNNY TEC OS
   CHAT MASTER CONTROLLER

   RESPONSIBILITY:
   This file coordinates the Chat page.

   It connects:
   - Chat state
   - Chat shell
   - Sidebar
   - Conversations
   - Messages
   - Composer
   - Optional features

   Backend requests remain inside api.js
   and the individual modules.
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
        "Previous chat cleanup failed:",
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
      "Chat state creation failed:",
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
      "Chat shell creation failed:",
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
     MODULE CLEANUPS
     ========================================= */

  let sidebarCleanup = null;

  let conversationsCleanup = null;

  let messagesCleanup = null;

  let composerCleanup = null;

  let featuresCleanup = null;


  /* =========================================
     MESSAGE HELPERS
     =========================================

     These wrappers connect the composer
     directly to the message module.
     ========================================= */

  const messagesContainer =
    elements.messagesContainer;


  function addChatMessage(
    role,
    content,
    id = null
  ) {

    if (!messagesContainer) {

      console.warn(
        "Johnny Tec OS: Messages container missing."
      );

      return null;

    }


    const message =
      state.addMessage(
        role,
        content,
        id
      );


    appendMessage(
      messagesContainer,
      message
    );


    return message;

  }


  function clearChatMessages() {

    state.clearMessages();

    clearMessages(
      messagesContainer
    );

  }


  function showStatus(
    message = "",
    isError = false
  ) {

    const status =
      elements.chatStatus ||
      elements.status;


    if (!status) {

      return;

    }


    status.textContent =
      message || "";


    status.classList.toggle(
      "error",
      Boolean(isError)
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

      return;

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


      state.clearMessages();


      const normalizedMessages =
        serverMessages.map(
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
        );


      state.messages =
        normalizedMessages;


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
     * Refresh conversation list.
     */

    if (
      typeof renderConversationList ===
      "function"
    ) {

      const conversations =
        await loadConversations(
          api
        );

      renderConversationList(
        conversations
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


    list.innerHTML = "";


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
     CONVERSATION CHANGE
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
     * Keep the local state synchronized.
     */

    if (
      userMessage &&
      state.messages.length === 0
    ) {

      state.addMessage(
        "user",
        userMessage
      );

    }


    /*
     * Refresh the conversation list
     * after a successful message.
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
        "Johnny Tec OS: Conversation refresh failed:",
        error
      );

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
      "Sidebar initialization failed:",
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
      "Conversation initialization failed:",
      error
    );

    showStatus(
      error?.message ||
      "Unable to load conversations.",
      true
    );

  }


  /* =========================================
     MESSAGES
     ========================================= */

  try {

    const result =
      await initializeMessages({

        elements,

        state,

        user,

        displayName,

        messagesContainer,

        getMessages() {

          return state.messages;

        }

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
      "Message initialization failed:",
      error
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

          addMessage:
            addChatMessage,

          showStatus,

          onConversationChanged

        }

      });

  } catch (error) {

    console.error(
      "Composer initialization failed:",
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
      "Optional chat features failed:",
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
          "Chat module cleanup failed:",
          error
        );

      }

    }


    try {

      state.destroy();

    } catch (error) {

      console.warn(
        "Chat state cleanup failed:",
        error
      );

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
