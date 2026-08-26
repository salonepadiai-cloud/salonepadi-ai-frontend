/* =========================================
   SalonePadi AI
   Conversations Module

   RESPONSIBILITY:
   This file owns conversation data operations.

   It handles:
   - Load conversations
   - Create conversations
   - Load conversation messages
   - Delete conversations
   - Build display titles
   - Remember conversation titles
   - Clear deleted conversation titles

   It does NOT:
   - Render sidebar UI
   - Handle sidebar buttons
   - Manage chat state
   - Render messages
   - Send AI messages
   - Manage composer/input
   ========================================= */


const TITLE_CACHE_PREFIX =
  "salonepadi_conversation_titles_";


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
      JSON.stringify(cache)
    );

  } catch (error) {

    console.warn(
      "Conversation title cache error:",
      error
    );

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
   * The backend remains the source of truth.
   *
   * Do NOT replace this with localStorage-only
   * deletion.
   */

  const result =
    await api.delete(
      `/api/chat/conversations/${encodeURIComponent(id)}`
    );


  /*
   * Remove the cached display title after
   * the backend deletion succeeds.
   */

  clearConversationTitleCache(
    id
  );


  return result;

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
     *
     * This prevents a deleted conversation title
     * from reappearing for any cached user.
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
            JSON.stringify(cache)
          );

        }

      } catch {
        /*
         * Ignore a damaged cache and continue
         * processing the remaining caches.
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
