/*
|--------------------------------------------------------------------------
| CONVERSATIONS MODULE
|--------------------------------------------------------------------------
|
| Handles recent-chat data helpers and title memory.
| It does not own the chat UI.
|--------------------------------------------------------------------------
*/

const TITLE_CACHE_PREFIX =
  "salonepadi_conversation_titles_";

export async function loadConversations(
  api
) {
  const data =
    await api.get(
      "/api/chat/conversations"
    );

  const conversations =
    Array.isArray(data?.conversations)
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

export async function createConversation(
  api,
  title = "New Chat"
) {
  const data =
    await api.post(
      "/api/chat/conversations",
      {
        title
      }
    );

  if (!data?.conversation?.id) {
    throw new Error(
      "The server did not return a conversation."
    );
  }

  return data.conversation;
}

export async function switchConversationData(
  api,
  id
) {
  if (!id) {
    throw new Error(
      "Conversation ID is required."
    );
  }

  return api.get(
    `/api/chat/conversations/${id}/messages`
  );
}

export function buildDisplayTitle(
  message
) {
  const clean =
    String(message || "")
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  if (!clean) {
    return "New Chat";
  }

  const max =
    42;

  if (clean.length <= max) {
    return clean;
  }

  return (
    clean
      .slice(0, max)
      .trim() +
    "..."
  );
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
        .slice(0, 100);

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


export async function deleteConversation(
  api,
  id
) {
  if (!id) {
    throw new Error(
      "Conversation ID is required."
    );
  }

  /*
   * The frontend deliberately calls the backend DELETE endpoint.
   * The database remains the source of truth.
   */
  const result =
    await api.delete(
      `/api/chat/conversations/${encodeURIComponent(id)}`
    );

  clearConversationTitleCache(
    id
  );

  return result;
}

export function clearConversationTitleCache(
  id
) {
  if (!id) {
    return;
  }

  try {
    /*
     * Remove the title from every SalonePadi title cache.
     * This keeps old titles from returning after a backend delete.
     */
    const prefix =
      TITLE_CACHE_PREFIX;

    for (
      let index = 0;
      index < localStorage.length;
      index += 1
    ) {
      const key =
        localStorage.key(index);

      if (
        !key ||
        !key.startsWith(prefix)
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
        // Ignore one damaged title cache.
      }
    }
  } catch (error) {
    console.warn(
      "Conversation title cache cleanup error:",
      error
    );
  }
}
