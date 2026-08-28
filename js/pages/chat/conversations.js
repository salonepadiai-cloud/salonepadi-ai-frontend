/*
|--------------------------------------------------------------------------
| JOHNNY TEC OS — CONVERSATIONS MODULE
|--------------------------------------------------------------------------
|
| RESPONSIBILITY:
| - Load conversations
| - Create conversations
| - Load conversation messages
| - Switch conversations
| - Delete conversations
| - Build conversation titles
| - Cache conversation titles
|
| This module does NOT:
| - Render message HTML
| - Send AI messages
| - Manage authentication
| - Manage composer UI
|
|--------------------------------------------------------------------------
*/

import { api as defaultApi } from "../../api.js";


const TITLE_CACHE_PREFIX =
  "johnny_tec_os_conversation_titles_";


/* =========================================================================
   INITIALIZE CONVERSATIONS
   ========================================================================= */

export async function initializeConversations(
  context = {}
) {

  const {
    api = defaultApi,
    elements = {},
    state,
    user,
    actions = {}
  } = context;


  if (!api) {
    throw new Error(
      "Johnny Tec OS: Conversation API is unavailable."
    );
  }


  if (!state) {
    throw new Error(
      "Johnny Tec OS: Chat state is required."
    );
  }


  const conversationList =
    elements.conversationList;


  const {
    renderConversationList,
    loadMessages,
    startNewChat,
    showStatus,
    closeSidebars
  } = actions;


  const cleanups = [];


  /* -----------------------------------------------------------------------
     EVENT BIND
     ----------------------------------------------------------------------- */

  function bind(
    element,
    event,
    handler
  ) {

    if (
      !element ||
      typeof handler !== "function"
    ) {
      return;
    }


    element.addEventListener(
      event,
      handler
    );


    cleanups.push(() => {

      element.removeEventListener(
        event,
        handler
      );

    });

  }


  /* -----------------------------------------------------------------------
     LOAD CONVERSATIONS
     ----------------------------------------------------------------------- */

  let conversations =
    await loadConversations(api);


  /*
   * Create the first conversation only when
   * the account has no conversations.
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


  /* -----------------------------------------------------------------------
     RESOLVE TITLES
     ----------------------------------------------------------------------- */

  const resolvedConversations =
    await Promise.all(
      conversations.map(
        async conversation => {

          const displayTitle =
            await getResolvedConversationTitle(
              api,
              user,
              conversation
            );


          return {
            ...conversation,
            displayTitle
          };

        }
      )
    );


  /* -----------------------------------------------------------------------
     RENDER LIST
     ----------------------------------------------------------------------- */

  if (
    typeof renderConversationList ===
    "function"
  ) {

    renderConversationList(
      resolvedConversations
    );

  }


  /* -----------------------------------------------------------------------
     SELECT FIRST CONVERSATION
     ----------------------------------------------------------------------- */

  const first =
    resolvedConversations[0];


  if (first?.id) {

    state.setConversation(
      first.id,
      first.displayTitle ||
      first.title ||
      "New Chat"
    );


    if (
      typeof loadMessages ===
      "function"
    ) {

      await loadMessages(
        first.id
      );

    }

  }


  /* -----------------------------------------------------------------------
     CONVERSATION CLICK
     ----------------------------------------------------------------------- */

  bind(
    conversationList,
    "click",
    async event => {

      const deleteButton =
        event.target.closest(
          ".conversation-delete-button"
        );


      if (deleteButton) {
        return;
      }


      const item =
        event.target.closest(
          ".conversation-item"
        );


      if (!item) {
        return;
      }


      const id =
        item.dataset.conversationId;


      if (!id) {
        return;
      }


      try {

        await switchConversation(
          api,
          id,
          {
            state,
            user,
            actions: {
              ...actions,
              closeSidebars
            }
          }
        );

      } catch (error) {

        console.error(
          "Johnny Tec OS: Conversation switch failed:",
          error
        );

      }

    }
  );


  /* -----------------------------------------------------------------------
     NEW CHAT
     ----------------------------------------------------------------------- */

  bind(
    elements.newChatButton,
    "click",
    async event => {

      event.preventDefault();


      try {

        /*
         * Prefer the controller implementation.
         */

        if (
          typeof startNewChat ===
          "function"
        ) {

          await startNewChat();

          return;

        }


        /*
         * Fallback implementation.
         */

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


        state.clearMessages();


        if (
          typeof loadMessages ===
          "function"
        ) {

          await loadMessages(
            conversation.id
          );

        }


        const fresh =
          await loadConversations(
            api
          );


        const resolved =
          await Promise.all(
            fresh.map(
              async item => ({
                ...item,
                displayTitle:
                  await getResolvedConversationTitle(
                    api,
                    user,
                    item
                  )
              })
            )
          );


        if (
          typeof renderConversationList ===
          "function"
        ) {

          renderConversationList(
            resolved
          );

        }


        if (
          typeof closeSidebars ===
          "function"
        ) {

          closeSidebars();

        }

      } catch (error) {

        console.error(
          "Johnny Tec OS: New chat failed:",
          error
        );


        if (
          typeof showStatus ===
          "function"
        ) {

          showStatus(
            error?.message ||
            "Unable to create a new chat.",
            true
          );

        }

      }

    }
  );


  /* -----------------------------------------------------------------------
     CLEANUP
     ----------------------------------------------------------------------- */

  return () => {

    for (
      const cleanup of cleanups
    ) {

      try {

        cleanup();

      } catch (error) {

        console.warn(
          "Johnny Tec OS: Conversation cleanup failed:",
          error
        );

      }

    }

  };

}


/* =========================================================================
   LOAD CONVERSATIONS
   ========================================================================= */

export async function loadConversations(
  api = defaultApi
) {

  if (!api) {
    throw new Error(
      "Johnny Tec OS: API client is required."
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


/* =========================================================================
   CREATE CONVERSATION
   ========================================================================= */

export async function createConversation(
  api = defaultApi,
  title = "New Chat"
) {

  if (!api) {
    throw new Error(
      "Johnny Tec OS: API client is required."
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
      "Johnny Tec OS: Server did not return a conversation."
    );

  }


  return conversation;

}


/* =========================================================================
   LOAD CONVERSATION MESSAGES
   ========================================================================= */

export async function switchConversationData(
  api = defaultApi,
  id
) {

  if (!api) {
    throw new Error(
      "Johnny Tec OS: API client is required."
    );
  }


  if (!id) {
    throw new Error(
      "Johnny Tec OS: Conversation ID is required."
    );
  }


  return api.get(
    `/api/chat/conversations/${encodeURIComponent(
      id
    )}/messages`
  );

}


/* =========================================================================
   SWITCH CONVERSATION
   ========================================================================= */

export async function switchConversation(
  api = defaultApi,
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
      "Johnny Tec OS: API client is required."
    );
  }


  if (!state) {
    throw new Error(
      "Johnny Tec OS: Chat state is required."
    );
  }


  if (!id) {
    throw new Error(
      "Johnny Tec OS: Conversation ID is required."
    );
  }


  /*
   * Already active.
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
        conversation || { id }
      );


    state.setConversation(
      id,
      title
    );


    state.clearMessages();


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
        conversations.map(
          item => ({
            ...item,
            displayTitle:
              item.id === id
                ? title
                : item.displayTitle ||
                  item.title ||
                  "New Chat"
          })
        )
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
      "Johnny Tec OS: Conversation switch failed:",
      error
    );


    if (
      typeof showStatus ===
      "function"
    ) {

      showStatus(
        error?.message ||
        "Unable to load conversation.",
        true
      );

    }


    throw error;

  }

}


/* =========================================================================
   DELETE CONVERSATION
   ========================================================================= */

export async function deleteConversation(
  api = defaultApi,
  id
) {

  if (!api) {
    throw new Error(
      "Johnny Tec OS: API client is required."
    );
  }


  if (!id) {
    throw new Error(
      "Johnny Tec OS: Conversation ID is required."
    );
  }


  const result =
    await api.delete(
      `/api/chat/conversations/${encodeURIComponent(
        id
      )}`
    );


  clearConversationTitleCache(
    id
  );


  return result;

}


/* =========================================================================
   BUILD DISPLAY TITLE
   ========================================================================= */

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


  const maxLength = 42;


  if (
    clean.length <= maxLength
  ) {

    return clean;

  }


  return (
    clean
      .slice(0, maxLength)
      .trim() +
    "..."
  );

}


/* =========================================================================
   GENERIC TITLE CHECK
   ========================================================================= */

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


/* =========================================================================
   RESOLVE TITLE
   ========================================================================= */

export async function getResolvedConversationTitle(
  api = defaultApi,
  user,
  conversation
) {

  if (!conversation?.id) {
    return "New Chat";
  }


  /*
   * 1. Cached title.
   */

  const cached =
    getConversationTitle(
      user,
      conversation.id
    );


  if (
    cached &&
    !isGenericConversationTitle(cached)
  ) {

    return cached;

  }


  /*
   * 2. Server title.
   */

  const serverTitle =
    conversation.title || "";


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
   * 3. Derive from first user message.
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
          message?.role === "user" &&
          String(
            message?.content || ""
          ).trim()
      );


    if (firstUserMessage) {

      const title =
        buildDisplayTitle(
          firstUserMessage.content
        );


      rememberConversationTitle(
        user,
        conversation.id,
        title
      );


      return title;

    }

  } catch (error) {

    console.warn(
      "Johnny Tec OS: Unable to derive conversation title:",
      error
    );

  }


  return buildDisplayTitleFromDate(
    conversation.updated_at
  );

}


/* =========================================================================
   TITLE CACHE
   ========================================================================= */

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
      localStorage.getItem(key);


    if (!raw) {
      return null;
    }


    const cache =
      JSON.parse(raw);


    return typeof cache?.[id] ===
      "string"
      ? cache[id]
      : null;

  } catch (error) {

    console.warn(
      "Johnny Tec OS: Title cache read failed:",
      error
    );


    return null;

  }

}


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
      localStorage.getItem(key);


    const cache =
      raw
        ? JSON.parse(raw)
        : {};


    cache[id] =
      String(title)
        .trim()
        .slice(0, 100);


    localStorage.setItem(
      key,
      JSON.stringify(cache)
    );

  } catch (error) {

    console.warn(
      "Johnny Tec OS: Title cache write failed:",
      error
    );

  }

}


/* =========================================================================
   REMEMBER FIRST MESSAGE AS TITLE
   ========================================================================= */

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
    buildDisplayTitle(message);


  rememberConversationTitle(
    user,
    conversationId,
    title
  );


  return title;

}


/* =========================================================================
   DATE TITLE
   ========================================================================= */

export function buildDisplayTitleFromDate(
  value
) {

  if (!value) {
    return "New Chat";
  }


  const date =
    new Date(value);


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


/* =========================================================================
   CLEAR TITLE CACHE
   ========================================================================= */

export function clearConversationTitleCache(
  id
) {

  if (!id) {
    return;
  }


  try {

    for (
      let index = 0;
      index < localStorage.length;
      index += 1
    ) {

      const key =
        localStorage.key(index);


      if (
        !key ||
        !key.startsWith(
          TITLE_CACHE_PREFIX
        )
      ) {

        continue;
      }


      const raw =
        localStorage.getItem(key);


      if (!raw) {
        continue;
      }


      try {

        const cache =
          JSON.parse(raw);


        if (
          Object.prototype.hasOwnProperty.call(
            cache,
            id
          )
        ) {

          delete cache[id];


          localStorage.setItem(
            key,
            JSON.stringify(cache)
          );

        }

      } catch {
        /* Ignore damaged cache. */
      }

    }

  } catch (error) {

    console.warn(
      "Johnny Tec OS: Title cache cleanup failed:",
      error
    );

  }

}


/* =========================================================================
   DEFAULT EXPORT
   ========================================================================= */

export default initializeConversations;
