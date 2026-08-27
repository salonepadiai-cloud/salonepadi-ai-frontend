/* =========================================
   SalonePadi AI
   Chat Master Controller

   RESPONSIBILITY:
   This file ONLY coordinates the Chat page.
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
  initializeConversations
} from "./chat/conversations.js";

import {
  initializeMessages
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
      "SalonePadi AI: Chat container was not found."
    );

    return;
  }


  /* =========================================
     1. AUTHENTICATION
     ========================================= */

  if (!authenticated()) {

    window.location.hash = "#/login";

    return;
  }


  /* =========================================
     2. CLEAN PREVIOUS CHAT
     ========================================= */

  if (typeof activeCleanup === "function") {

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
     3. CURRENT USER
     ========================================= */

  const user = currentUser();

  const displayName =
    user?.user_metadata?.name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";


  /* =========================================
     4. CREATE CHAT STATE
     ========================================= */

  let state;

  try {

    state = createChatState();

  } catch (error) {

    console.error(
      "Chat state creation failed:",
      error
    );

    return;
  }


  if (!state) {

    console.error(
      "SalonePadi AI: createChatState() returned nothing."
    );

    return;
  }


  /* =========================================
     5. CREATE CHAT SHELL
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

    try {
      state.destroy();
    } catch (_) {}

    return;
  }


  if (!elements) {

    console.error(
      "SalonePadi AI: Chat shell could not be created."
    );

    try {
      state.destroy();
    } catch (_) {}

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


  /*
   * Message actions supplied by messages.js.
   *
   * We keep these outside the initializer so
   * the Composer can use the same message layer.
   */

  let messageActions = {};


  /* =========================================
     6. SIDEBAR
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
     7. CONVERSATIONS
     ========================================= */

  try {

    conversationsCleanup =
      await initializeConversations({
        elements,
        state,
        user,
        displayName,
        api
      });

  } catch (error) {

    console.error(
      "Conversation initialization failed:",
      error
    );

  }


  /* =========================================
     8. MESSAGES
     ========================================= */

  try {

    const result =
      await initializeMessages({
        elements,
        state,
        user,
        displayName
      });


    /*
     * messages.js may return its public
     * actions/cleanup object.
     */

    if (
      result &&
      typeof result === "object"
    ) {

      messageActions = result;

      if (
        typeof result.cleanup === "function"
      ) {

        messagesCleanup =
          result.cleanup;

      }

    } else if (
      typeof result === "function"
    ) {

      messagesCleanup =
        result;

    }

  } catch (error) {

    console.error(
      "Message initialization failed:",
      error
    );

  }


  /* =========================================
     9. COMPOSER
     ========================================= */

  try {

    composerCleanup =
      await initializeComposer({

        elements,

        state,

        user,

        displayName,

        /*
         * THIS WAS MISSING.
         *
         * Composer now receives the real
         * backend API client.
         */

        api,

        /*
         * Connect Composer to Messages.
         */

        actions: {

          addMessage:
            typeof messageActions.addMessage ===
            "function"

              ? messageActions.addMessage

              : (
                  role,
                  content
                ) => {

                  console.warn(
                    "Messages module has no addMessage() action."
                  );

                },


          showStatus:
            typeof messageActions.showStatus ===
            "function"

              ? messageActions.showStatus

              : (
                  message,
                  error = false
                ) => {

                  if (
                    elements.chatStatus
                  ) {

                    elements.chatStatus.textContent =
                      message || "";

                    elements.chatStatus.classList.toggle(
                      "error",
                      Boolean(error)
                    );

                  }

                },


          onConversationChanged:
            async (
              change = {}
            ) => {

              /*
               * Notify conversation module
               * if it exposes the action.
               */

              if (
                typeof messageActions.onConversationChanged ===
                "function"
              ) {

                return messageActions.onConversationChanged(
                  change
                );

              }

            }

        }

      });

  } catch (error) {

    console.error(
      "Composer initialization failed:",
      error
    );

  }


  /* =========================================
     10. OPTIONAL FEATURES
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
     11. CLEANUP
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
      activeCleanup === cleanup
    ) {

      activeCleanup = null;

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
