/* =========================================
   SalonePadi AI
   Sidebar Module

   RESPONSIBILITY:
   This file ONLY handles sidebar UI.

   It does NOT:
   - Render the chat shell
   - Manage chat state
   - Load conversations
   - Send messages
   - Render messages
   - Format AI responses
   - Handle backend chat requests
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
    user = null,
    displayName = "User"
  } = context;


  /*
   * DOM ELEMENTS
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
   * CLEANUP STORAGE
   */

  const listeners = [];


  /*
   * SAFE EVENT BINDER
   */

  function bind(
    element,
    event,
    handler
  ) {

    if (!element) {
      return;
    }

    element.addEventListener(
      event,
      handler
    );

    listeners.push(() => {

      element.removeEventListener(
        event,
        handler
      );

    });
  }


  /*
   * CLOSE ALL SIDEBARS
   */

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


  /*
   * OPEN SIDEBAR
   */

  function openSidebar(
    side
  ) {

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


    overlay?.classList.add(
      "show"
    );

  }


  /*
   * MOBILE LEFT MENU
   */

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


  /*
   * MOBILE RIGHT MENU / PROFILE
   */

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


  /*
   * CLOSE LEFT SIDEBAR
   */

  bind(
    closeLeftSidebar,
    "click",
    event => {

      event.preventDefault();

      closeSidebars();

    }
  );


  /*
   * CLOSE RIGHT SIDEBAR
   */

  bind(
    closeRightSidebar,
    "click",
    event => {

      event.preventDefault();

      closeSidebars();

    }
  );


  /*
   * MOBILE OVERLAY
   */

  bind(
    overlay,
    "click",
    event => {

      event.preventDefault();

      closeSidebars();

    }
  );


  /*
   * NEW CHAT
   *
   * The actual conversation creation belongs
   * to conversations.js.
   *
   * We only notify the controller/module here.
   */

  bind(
    newChatButton,
    "click",
    event => {

      event.preventDefault();

      closeSidebars();


      if (
        typeof context.onNewChat ===
        "function"
      ) {

        context.onNewChat();

      }

    }
  );


  /*
   * SETTINGS
   */

  function handleSettings(
    event
  ) {

    event.preventDefault();

    closeSidebars();


    if (
      typeof context.onSettings ===
      "function"
    ) {

      context.onSettings();

    }

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


  /*
   * PROFILE
   */

  bind(
    profileButton,
    "click",
    event => {

      event.preventDefault();

      closeSidebars();


      if (
        typeof context.onProfile ===
        "function"
      ) {

        context.onProfile();

      }

    }
  );


  /*
   * LOGOUT
   */

  bind(
    logoutButton,
    "click",
    async event => {

      event.preventDefault();


      if (
        typeof context.onLogout !==
        "function"
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

        await context.onLogout();

      } catch (error) {

        console.error(
          "Sidebar logout error:",
          error
        );

      } finally {

        logoutButton.disabled =
          false;

      }

    }
  );


  /*
   * CONVERSATION DELETE GUARD
   *
   * Conversation loading/deletion itself
   * belongs to conversations.js.
   *
   * This only prevents a delete button from
   * triggering the conversation selection.
   */

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


    event.stopPropagation();

  }


  bind(
    conversationList,
    "click",
    stopDeletePropagation
  );


  /*
   * RETURN CLEANUP
   */

  return () => {

    for (
      const cleanup of listeners
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

  };

}
