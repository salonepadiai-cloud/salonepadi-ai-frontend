/* =========================================
   SalonePadi AI
   Conversations Module

   RESPONSIBILITY:
   This file owns conversation operations.

   It handles:
   - Load conversations
   - Create conversations
   - Load conversation messages
   - Switch conversations
   - Delete conversations
   - Build display titles
   - Remember conversation titles
   - Resolve generic conversation titles
   - Initialize conversation interactions

   It does NOT:
   - Render message HTML
   - Send AI messages
   - Manage composer/input
   - Manage sidebar open/close
   - Manage authentication
   - Own the AI memory system
   ========================================= */


const TITLE_CACHE_PREFIX =
  "salonepadi_conversation_titles_";


/* =========================================
   INITIALIZE CONVERSATIONS
   ========================================= */

export async function initializeConversations(
  context = {}
) {

  const {
    api,
    elements = {},
    state,
    user,
    actions = {}
  } = context;


  if (!api) {
    throw new Error(
      "Conversation API client is required."
    );
  }


  if (!state) {
    throw new Error(
      "Chat state is required."
    );
  }


  const conversationList =
    elements.conversationList;


  /*
   * Actions supplied by the master controller.
   *
   * This keeps this module from owning message
   * rendering or sidebar rendering.
   */

  const {
    renderConversationList,
    loadMessages,
    startNewChat,
    showStatus
  } = actions;


  const cleanups = [];


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
     LOAD INITIAL CONVERSATIONS
     ========================================= */

  let conversations =
    await loadConversations(
      api
    );


  /*
   * If the user has no conversations yet,
   * create exactly ONE initial conversation.
   *
   * This prevents the old problem where every
   * page render created another "New Chat".
   */

  if (
    conversations.length === 0
  ) {

    const conversation =
      await createConversation(
        api,
        "New Chat"
      );


    conversations = [
      conversation
    ];

  }


  /* =========================================
     RESOLVE TITLES
     ========================================= */

  const resolvedConversations =
    await Promise.all(
      conversations.map(
        async conversation => {

          const title =
            await getResolvedConversationTitle(
              api,
              user,
              conversation
            );


          return {
            ...conversation,
            displayTitle:
              title
          };

        }
      )
    );


  /*
   * Display the conversations through the
   * controller-provided renderer.
   */

  if (
    typeof renderConversationList ===
    "function"
  ) {

    renderConversationList(
      resolvedConversations
    );

  }


  /* =========================================
     SELECT INITIAL CONVERSATION
     ========================================= */

  const first =
    resolvedConversations[0];


  if (first?.id) {

    state.setConversation(
      first.id,
      first.displayTitle ||
      first.title ||
      "New Chat"
    );


    /*
     * Message rendering/loading stays outside
     * this module.
     */

    if (
      typeof loadMessages ===
      "function"
    ) {

      await loadMessages(
        first.id
      );

    }

  }


  /* =========================================
     CONVERSATION LIST EVENTS
     ========================================= */

  bind(
    conversationList,
    "click",
    async event => {

      /*
       * Find the actual conversation item.
       */

      const item =
        event.target.closest(
          ".conversation-item"
        );


      if (!item) {
        return;
      }


      /*
       * Delete buttons are handled separately.
       */

      if (
        event.target.closest(
          ".conversation-delete-button"
        )
      ) {
        return;
      }


      const id =
        item.dataset.conversationId;


      if (!id) {
        return;
      }


      await switchConversation(
        api,
        id,
        {
          state,
          user,
          actions
        }
      );

    }
  );


  /* =========================================
     NEW CHAT BUTTON
     ========================================= */

  bind(
    elements.newChatButton,
    "click",
    async event => {

      event.preventDefault();


      /*
       * Prefer the controller-provided
       * startNewChat function.
       */

      if (
        typeof startNewChat ===
        "function"
      ) {

        try {

          await startNewChat();

        } catch (error) {

          console.error(
            "Start new chat failed:",
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


        return;

      }


      /*
       * Fallback if the controller has not
       * supplied startNewChat yet.
       */

      try {

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


        if (
          typeof renderConversationList ===
          "function"
        ) {

          const fresh =
            await loadConversations(
              api
            );


          renderConversationList(
            fresh
          );

        }


        if (
          typeof loadMessages ===
          "function"
        ) {

          await loadMessages(
            conversation.id
          );

        }

      } catch (error) {

        console.error(
          "Fallback new chat failed:",
          error
        );


        if (
          typeof showStatus ===
          "function"
        ) {

          showStatus(
            error.message ||
            "Unable to create a new chat.",
            true
          );

        }

      }

    }
  );


  /* =========================================
     RETURN CLEANUP
     ========================================= */

  return () => {

    for (
      const cleanup of cleanups
    ) {

      try {

        cleanup();

      } catch (error) {

        console.warn(
          "Conversation event cleanup failed:",
          error
        );

      }

    }

  };

}


/* =========================================
   LOAD CONVERSATIONS
   ========================================= */

export async function loadConversations(
  api
) {

  if (!api) {
    throw new Error(
      "API client is required."
    );
  }


  const data =
    await api.get(
      "/api/chat/conversations"
    );


  const conversations =
    Array.isArray(
      data?.conversations
    )
      ? data.conversations
      : [];


  /*
   * Always return newest conversations first.
   */

  return conversations
    .slice()
    .sort(
      (a, b) =>
        new Date(
          b?.updated_at || 0
        ) -
        new Date(
          a?.updated_at || 0
        )
    );

}


/* =========================================
   CREATE CONVERSATION
   ========================================= */

export async function createConversation(
  api,
  title = "New Chat"
) {

  if (!api) {
    throw new Error(
      "API client is required."
    );
  }


  const data =
    await api.post(
      "/api/chat/conversations",
      {
        title
      }
    );


  const conversation =
    data?.conversation;


  if (!conversation?.id) {
    throw new Error(
      "The server did not return a conversation."
    );
  }


  return conversation;

}


/* =========================================
   LOAD CONVERSATION MESSAGES
   ========================================= */

export async function switchConversationData(
  api,
  id
) {

  if (!api) {
    throw new Error(
      "API client is required."
    );
  }


  if (!id) {
    throw new Error(
      "Conversation ID is required."
    );
  }


  return api.get(
    `/api/chat/conversations/${encodeURIComponent(id)}/messages`
  );

}


/* =========================================
   SWITCH CONVERSATION
   ========================================= */

export async function switchConversation(
  api,
  id,
  context = {}
) {

  const {
    state,
    user,
    actions = {}
  } = context;


  if (!api) {
    throw new Error(
      "API client is required."
    );
  }


  if (!id) {
    throw new Error(
      "Conversation ID is required."
    );
  }


  if (!state) {
    throw new Error(
      "Chat state is required."
    );
  }


  /*
   * If the user clicked the conversation
   * already open, there is nothing to load.
   */

  if (
    id === state.conversationId
  ) {

    return;

  }


  const {
    loadMessages,
    renderConversationList,
    showStatus,
    closeSidebars
  } = actions;


  try {

    if (
      typeof showStatus ===
      "function"
    ) {

      showStatus(
        "Loading conversation..."
      );

    }


    /*
     * Get the conversation list so we can
     * resolve the selected conversation title.
     */

    const conversations =
      await loadConversations(
        api
      );


    const conversation =
      conversations.find(
        item =>
          item?.id === id
      );


    const title =
      await getResolvedConversationTitle(
        api,
        user,
        conversation || {
          id
        }
      );


    state.setConversation(
      id,
      title
    );


    /*
     * Load messages through the message
     * module/controller.
     */

    if (
      typeof loadMessages ===
      "function"
    ) {

      await loadMessages(
        id
      );

    }


    if (
      typeof renderConversationList ===
      "function"
    ) {

      renderConversationList(
        conversations
      );

    }


    if (
      typeof closeSidebars ===
      "function"
    ) {

      closeSidebars();

    }


    if (
      typeof showStatus ===
      "function"
    ) {

      showStatus("");

    }

  } catch (error) {

    console.error(
      "Conversation switch failed:",
      error
    );


    if (
      typeof showStatus ===
      "function"
    ) {

      showStatus(
        error.message ||
        "Unable to load conversation.",
        true
      );

    }


    throw error;

  }

}


/* =========================================
   DELETE CONVERSATION
   ========================================= */

export async function deleteConversation(
  api,
  id
) {

  if (!api) {
    throw new Error(
      "API client is required."
    );
  }


  if (!id) {
    throw new Error(
      "Conversation ID is required."
    );
  }


  /*
   * Backend remains the source of truth.
   */

  const result =
    await api.delete(
      `/api/chat/conversations/${encodeURIComponent(id)}`
    );


  /*
   * Only clear local title cache after
   * backend deletion succeeds.
   */

  clearConversationTitleCache(
    id
  );


  return result;

}


/* =========================================
   BUILD DISPLAY TITLE
   ========================================= */

export function buildDisplayTitle(
  message
) {

  const clean =
    String(
      message || ""
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim();


  if (!clean) {
    return "New Chat";
  }


  const maxLength =
    42;


  if (
    clean.length <=
    maxLength
  ) {

    return clean;

  }


  return (
    clean
      .slice(
        0,
        maxLength
      )
      .trim() +
    "..."
  );

}


/* =========================================
   GENERIC TITLE CHECK
   ========================================= */

export function isGenericConversationTitle(
  title
) {

  const normalized =
    String(
      title || ""
    )
      .trim()
      .toLowerCase();


  return (
    !normalized ||
    normalized === "new chat" ||
    normalized === "new conversation"
  );

}


/* =========================================
   RESOLVE CONVERSATION TITLE
   ========================================= */

export async function getResolvedConversationTitle(
  api,
  user,
  conversation
) {

  if (!conversation?.id) {
    return "New Chat";
  }


  /*
   * 1. Local cached title.
   */

  const cached =
    getConversationTitle(
      user,
      conversation.id
    );


  if (
    cached &&
    !isGenericConversationTitle(
      cached
    )
  ) {

    return cached;

  }


  /*
   * 2. Backend title.
   */

  const serverTitle =
    conversation.title ||
    "";


  if (
    serverTitle &&
    !isGenericConversationTitle(
      serverTitle
    )
  ) {

    rememberConversationTitle(
      user,
      conversation.id,
      serverTitle
    );


    return serverTitle;

  }


  /*
   * 3. Look at the first user message.
   */

  try {

    const data =
      await switchConversationData(
        api,
        conversation.id
      );


    const messages =
      Array.isArray(
        data?.messages
      )
        ? data.messages
        : [];


    const firstUserMessage =
      messages.find(
        message =>
          message?.role ===
            "user" &&
          String(
            message?.content || ""
          ).trim()
      );


    if (firstUserMessage) {

      const derivedTitle =
        buildDisplayTitle(
          firstUserMessage.content
        );


      rememberConversationTitle(
        user,
        conversation.id,
        derivedTitle
      );


      return derivedTitle;

    }

  } catch (error) {

    console.warn(
      "Unable to derive conversation title:",
      error
    );

  }


  /*
   * 4. Last-resort title.
   */

  return buildDisplayTitleFromDate(
    conversation.updated_at
  );

}


/* =========================================
   GET CACHED CONVERSATION TITLE
   ========================================= */

export function getConversationTitle(
  user,
  id
) {

  if (
    !user?.id ||
    !id
  ) {

    return null;

  }


  try {

    const key =
      `${TITLE_CACHE_PREFIX}${user.id}`;


    const raw =
      localStorage.getItem(
        key
      );


    if (!raw) {
      return null;
    }


    const cache =
      JSON.parse(
        raw
      );


    return (
      typeof cache?.[id] ===
      "string"
        ? cache[id]
        : null
    );

  } catch (error) {

    console.warn(
      "Conversation title cache read error:",
      error
    );


    return null;

  }

}


/* =========================================
   REMEMBER CONVERSATION TITLE
   ========================================= */

export function rememberConversationTitle(
  user,
  id,
  title
) {

  if (
    !user?.id ||
    !id ||
    !title
  ) {

    return;

  }


  try {

    const key =
      `${TITLE_CACHE_PREFIX}${user.id}`;


    const raw =
      localStorage.getItem(
        key
      );


    const cache =
      raw
        ? JSON.parse(raw)
        : {};


    cache[id] =
      String(title)
        .trim()
        .slice(
          0,
          100
        );


    localStorage.setItem(
      key,
      JSON.stringify(
        cache
      )
    );

  } catch (error) {

    console.warn(
      "Conversation title cache error:",
      error
    );

  }

}


/* =========================================
   UPDATE TITLE FROM FIRST MESSAGE
   ========================================= */

export function rememberMessageAsTitle(
  user,
  conversationId,
  message
) {

  if (
    !conversationId ||
    !message
  ) {

    return "New Chat";

  }


  const title =
    buildDisplayTitle(
      message
    );


  rememberConversationTitle(
    user,
    conversationId,
    title
  );


  return title;

}


/* =========================================
   BUILD DATE TITLE
   ========================================= */

export function buildDisplayTitleFromDate(
  value
) {

  if (!value) {
    return "New Chat";
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "Chat";

  }


  try {

    return `Chat · ${date.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short"
      }
    )}`;

  } catch {

    return "Chat";

  }

}


/* =========================================
   CLEAR CONVERSATION TITLE CACHE
   ========================================= */

export function clearConversationTitleCache(
  id
) {

  if (!id) {
    return;
  }


  try {

    const prefix =
      TITLE_CACHE_PREFIX;


    /*
     * Search all SalonePadi title caches.
     */

    for (
      let index = 0;
      index < localStorage.length;
      index += 1
    ) {

      const key =
        localStorage.key(
          index
        );


      if (
        !key ||
        !key.startsWith(
          prefix
        )
      ) {

        continue;

      }


      const raw =
        localStorage.getItem(
          key
        );


      if (!raw) {
        continue;
      }


      try {

        const cache =
          JSON.parse(
            raw
          );


        if (
          Object.prototype.hasOwnProperty.call(
            cache,
            id
          )
        ) {

          delete cache[id];


          localStorage.setItem(
            key,
            JSON.stringify(
              cache
            )
          );

        }

      } catch {

        /*
         * Ignore damaged individual cache.
         */

      }

    }

  } catch (error) {

    console.warn(
      "Conversation title cache cleanup error:",
      error
    );

  }
}
