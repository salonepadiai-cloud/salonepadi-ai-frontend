/* =========================================
   SalonePadi AI
   Sidebar Module

   RESPONSIBILITY:
   This file ONLY controls sidebar UI.

   It handles:
   - Left sidebar open/close
   - Right sidebar open/close
   - Mobile overlay
   - New Chat button delegation
   - Settings button hooks
   - Profile button hooks
   - Logout button
   - Delete-button click protection

   It does NOT:
   - Load conversations
   - Create conversations
   - Delete conversations from backend
   - Send messages
   - Render messages
   - Manage chat state
   - Format AI responses
   ========================================= */


/* =========================================
   INITIALIZE SIDEBAR
   ========================================= */

export function initializeSidebar(
  context = {}
) {

  const {
    elements = {},
    state = null,
    actions = {},
    user = null
  } = context;


  /*
   * DOM references.
   */

  const {
    leftSidebar,
    rightSidebar,
    overlay,

    leftMenuButton,
    rightMenuButton,

    closeLeftSidebar,
    closeRightSidebar,

    newChatButton,

    settingsButton,
    settingsButtonRight,

    profileButton,

    logoutButton,

    conversationList
  } = elements;


  /*
   * Action references supplied by chat.js
   * or other modules.
   */

  const {
    startNewChat,
    showStatus,
    logout: logoutAction
  } = actions;


  /*
   * Store event bindings so cleanup can
   * remove every listener safely.
   */

  const cleanups = [];


  /* =========================================
     SIDEBAR STATE HELPERS
     ========================================= */

  function closeSidebars() {

    leftSidebar?.classList.remove(
      "open"
    );

    rightSidebar?.classList.remove(
      "open"
    );

    overlay?.classList.remove(
      "show"
    );

  }


  function openSidebar(
    side
  ) {

    /*
     * Only one sidebar should be open
     * at a time.
     */

    closeSidebars();


    if (
      side === "left"
    ) {

      leftSidebar?.classList.add(
        "open"
      );

    }


    if (
      side === "right"
    ) {

      rightSidebar?.classList.add(
        "open"
      );

    }


    /*
     * Overlay is mainly for mobile,
     * but CSS decides how it behaves
     * on larger screens.
     */

    overlay?.classList.add(
      "show"
    );

  }


  /* =========================================
     EVENT HELPER
     ========================================= */

  function bind(
    element,
    event,
    handler
  ) {

    if (
      !element ||
      typeof handler !==
        "function"
    ) {
      return;
    }


    element.addEventListener(
      event,
      handler
    );


    cleanups.push(
      () => {

        element.removeEventListener(
          event,
          handler
        );

      }
    );

  }


  /* =========================================
     LEFT MENU
     ========================================= */

  bind(
    leftMenuButton,
    "click",
    event => {

      event.preventDefault();

      openSidebar(
        "left"
      );

    }
  );


  /* =========================================
     RIGHT MENU
     ========================================= */

  bind(
    rightMenuButton,
    "click",
    event => {

      event.preventDefault();

      openSidebar(
        "right"
      );

    }
  );


  /* =========================================
     CLOSE LEFT SIDEBAR
     ========================================= */

  bind(
    closeLeftSidebar,
    "click",
    event => {

      event.preventDefault();

      closeSidebars();

    }
  );


  /* =========================================
     CLOSE RIGHT SIDEBAR
     ========================================= */

  bind(
    closeRightSidebar,
    "click",
    event => {

      event.preventDefault();

      closeSidebars();

    }
  );


  /* =========================================
     OVERLAY
     ========================================= */

  bind(
    overlay,
    "click",
    event => {

      event.preventDefault();

      closeSidebars();

    }
  );


  /* =========================================
     ESCAPE KEY
     ========================================= */

  function handleEscape(
    event
  ) {

    if (
      event.key !==
      "Escape"
    ) {
      return;
    }


    closeSidebars();

  }


  bind(
    document,
    "keydown",
    handleEscape
  );


  /* =========================================
     NEW CHAT
     ========================================= */

  bind(
    newChatButton,
    "click",
    async event => {

      event.preventDefault();


      if (
        typeof startNewChat !==
        "function"
      ) {

        console.warn(
          "Sidebar: startNewChat action is unavailable."
        );

        return;

      }


      try {

        await startNewChat();

        closeSidebars();

      } catch (error) {

        console.error(
          "Sidebar new-chat error:",
          error
        );


        if (
          typeof showStatus ===
          "function"
        ) {

          showStatus(
            error.message ||
            "Unable to start a new chat.",
            true
          );

        }

      }

    }
  );


  /* =========================================
     SETTINGS
     ========================================= */

  function handleSettings(
    event
  ) {

    event.preventDefault();


    /*
     * Settings will eventually be connected
     * to the settings module.
     *
     * The sidebar itself does not implement
     * settings functionality.
     */

    if (
      typeof showStatus ===
      "function"
    ) {

      showStatus(
        "Settings will be available soon."
      );

    }


    closeSidebars();

  }


  bind(
    settingsButton,
    "click",
    handleSettings
  );


  bind(
    settingsButtonRight,
    "click",
    handleSettings
  );


  /* =========================================
     PROFILE
     ========================================= */

  bind(
    profileButton,
    "click",
    event => {

      event.preventDefault();


      /*
       * Profile functionality will eventually
       * belong to profile.js.
       */

      if (
        typeof showStatus ===
        "function"
      ) {

        showStatus(
          "Profile will be available soon."
        );

      }


      closeSidebars();

    }
  );


  /* =========================================
     LOGOUT
     ========================================= */

  bind(
    logoutButton,
    "click",
    async event => {

      event.preventDefault();


      /*
       * Prevent multiple logout clicks.
       */

      if (
        logoutButton.disabled
      ) {
        return;
      }


      logoutButton.disabled =
        true;


      logoutButton.innerHTML = `
        <span>⏳</span>
        <span>Logging out...</span>
      `;


      try {

        /*
         * If chat.js provides a logout
         * action, use it.
         */

        if (
          typeof logoutAction ===
          "function"
        ) {

          await logoutAction();

        } else {

          /*
           * Sidebar itself does not import
           * auth.js. This keeps authentication
           * outside the UI module.
           */

          window.location.hash =
            "#/login";

        }

      } catch (error) {

        console.error(
          "Sidebar logout error:",
          error
        );


        /*
         * Always leave the user with a valid
         * navigation destination.
         */

        window.location.hash =
          "#/login";

      }

    }
  );


  /* =========================================
     CONVERSATION DELETE PROTECTION
     ========================================= */

  function stopDeletePropagation(
    event
  ) {

    const deleteButton =
      event.target.closest(
        ".conversation-delete-button"
      );


    if (!deleteButton) {
      return;
    }


    /*
     * Conversation selection is normally
     * handled by the conversation module.
     *
     * A delete click must never bubble into
     * the conversation selection handler.
     */

    event.stopPropagation();

  }


  bind(
    conversationList,
    "click",
    stopDeletePropagation
  );


  /* =========================================
     PUBLIC SIDEBAR API
     ========================================= */

  /*
   * Other modules may need to close the
   * sidebar after completing an operation.
   */

  const sidebarAPI = {

    openLeft() {

      openSidebar(
        "left"
      );

    },

    openRight() {

      openSidebar(
        "right"
      );

    },

    close() {

      closeSidebars();

    }

  };


  /*
   * Keep the API attached to the state only
   * if state exists.
   *
   * This does NOT change the chat state model;
   * it simply gives the controller access to
   * sidebar controls when needed.
   */

  if (state) {

    state.sidebar =
      sidebarAPI;

  }


  /* =========================================
     CLEANUP
     ========================================= */

  return () => {

    for (
      const cleanup of cleanups
    ) {

      try {

        cleanup();

      } catch (error) {

        console.warn(
          "Sidebar cleanup failed:",
          error
        );

      }

    }


    /*
     * Remove the temporary sidebar API.
     */

    if (
      state?.sidebar ===
      sidebarAPI
    ) {

      delete state.sidebar;

    }


    closeSidebars();

  };

    }
