/* =========================================
   SalonePadi AI
   Chat Master Controller

   RESPONSIBILITY:
   This file ONLY coordinates the Chat page.

   It does NOT contain:
   - Message rendering
   - Conversation logic
   - Composer logic
   - Sidebar logic
   - AI formatting
   - Audio logic
   - Profile logic
   - Settings logic
   - Backend chat implementation

   Those responsibilities belong to their
   own modules.
   ========================================= */

import {
  authenticated,
  currentUser
} from "../auth.js";

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
  initializeComposer
} from "./chat/composer.js";

import {
  initializeMessages
} from "./chat/messages.js";

import {
  loadChatFeatures
} from "./chat/feature-loader.js";


let activeCleanup = null;


/* =========================================
   RENDER CHAT
   ========================================= */

export async function renderChat(container) {

  if (!container) {
    return;
  }


  /* -----------------------------------------
     1. CHECK AUTHENTICATION
     ----------------------------------------- */

  if (!authenticated()) {
    window.location.hash = "#/login";
    return;
  }


  /* -----------------------------------------
     CLEAN PREVIOUS CHAT INSTANCE
     ----------------------------------------- */

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


  /* -----------------------------------------
     CURRENT USER
     ----------------------------------------- */

  const user = currentUser();

  const displayName =
    user?.user_metadata?.name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";


  /* -----------------------------------------
     2. CREATE CHAT STATE
     ----------------------------------------- */

  const state =
    createChatState();


  /* -----------------------------------------
     3. CREATE CHAT SHELL
     ----------------------------------------- */

  const elements =
    createChatShell(
      container,
      {
        user,
        displayName
      }
    );


  if (!elements) {
    console.error(
      "Chat shell could not be created."
    );

    return;
  }


  /* -----------------------------------------
     4. INITIALIZE SIDEBAR
     ----------------------------------------- */

  let sidebarCleanup = null;

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


  /* -----------------------------------------
     5. INITIALIZE CONVERSATIONS
     ----------------------------------------- */

  let conversationsCleanup = null;

  try {

    conversationsCleanup =
      await initializeConversations({
        elements,
        state,
        user
      });

  } catch (error) {

    console.error(
      "Conversation initialization failed:",
      error
    );

  }


  /* -----------------------------------------
     6. INITIALIZE COMPOSER
     ----------------------------------------- */

  let composerCleanup = null;

  try {

    composerCleanup =
      await initializeComposer({
        elements,
        state,
        user,
        displayName
      });

  } catch (error) {

    console.error(
      "Composer initialization failed:",
      error
    );

  }


  /* -----------------------------------------
     7. INITIALIZE MESSAGES
     ----------------------------------------- */

  let messagesCleanup = null;

  try {

    messagesCleanup =
      await initializeMessages({
        elements,
        state,
        user,
        displayName
      });

  } catch (error) {

    console.error(
      "Message initialization failed:",
      error
    );

  }


  /* -----------------------------------------
     8. OPTIONAL FEATURES
     ----------------------------------------- */

  let featuresCleanup = null;

  try {

    featuresCleanup =
      await loadChatFeatures({

        elements,

        state,

        user,

        displayName

      });

  } catch (error) {

    /*
     * Optional features must NEVER
     * break the main chat.
     */

    console.warn(
      "Optional chat features failed:",
      error
    );

  }


  /* -----------------------------------------
     9. CLEANUP
     ----------------------------------------- */

  activeCleanup = () => {

    const cleanups = [
      featuresCleanup,
      messagesCleanup,
      composerCleanup,
      conversationsCleanup,
      sidebarCleanup
    ];


    for (const cleanup of cleanups) {

      if (
        typeof cleanup !== "function"
      ) {
        continue;
      }


      try {

        cleanup();

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


    activeCleanup = null;
  };


  /* -----------------------------------------
     CHAT READY
     ----------------------------------------- */

  return {
    state,
    elements,
    cleanup: activeCleanup
  };
}
