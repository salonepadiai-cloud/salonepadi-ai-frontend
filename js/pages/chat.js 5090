import {
  authenticated,
  currentUser,
  logout
} from "../auth.js";

import { api } from "../api.js";

import {
  createAudioButton,
  stopAudio
} from "./chat/audio.js";

import {
  addMessage as renderMessage
} from "./chat/messages.js";

import {
  createChatState
} from "./chat/chat-state.js";

import {
  loadConversations,
  createConversation,
  switchConversationData,
  deleteConversation,
  buildDisplayTitle,
  rememberConversationTitle
} from "./chat/conversations.js";

import {
  loadChatFeatures
} from "./chat/feature-loader.js";

let activeCleanup = null;

/*
|--------------------------------------------------------------------------
| SALONEPADI AI — MASTER CHAT CONTROLLER
|--------------------------------------------------------------------------
|
| This file is intentionally the controller, not the dumping ground for
| every feature.
|
| Core responsibilities:
|   - Render the main chat shell
|   - Connect API/authentication
|   - Coordinate conversations
|   - Coordinate messages
|   - Coordinate optional feature modules
|   - Keep the AI/backend contract unchanged
|
| Feature responsibilities live under ./chat/
|
|   audio.js              -> text-to-speech
|   messages.js           -> message rendering
|   conversations.js      -> recent-chat loading/title handling
|   chat-state.js         -> shared frontend state
|   feature-loader.js     -> safe feature initialization
|   sidebar.js             -> sidebar UI
|   composer.js            -> composer/input helpers
|   settings.js            -> settings hooks
|   profile.js             -> profile hooks
|   voice.js               -> live voice hook
|   attachments.js         -> attachment hook
|   message-actions.js     -> message actions
|   search.js              -> chat search hook
|   project-mode.js        -> project-context hook
|
| IMPORTANT:
| The backend AI pipeline is not changed here.
|
|--------------------------------------------------------------------------
*/

export async function renderChat(container) {
  if (!container) {
    return;
  }

  if (!authenticated()) {
    window.location.hash = "#/login";
    return;
  }

  const user = currentUser();
  const displayName =
    user?.user_metadata?.name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  /*
   * Stop any previous page-level cleanup before rendering a new instance.
   * This prevents duplicate listeners when navigating back to #/chat.
   */
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

  const state =
    createChatState();

  /*
  |--------------------------------------------------------------------------
  | CHAT SHELL
  |--------------------------------------------------------------------------
  */

  container.innerHTML = `
    <main class="chat-app">

      <!-- =====================================================
           LEFT SIDEBAR
           ===================================================== -->

      <aside
        id="leftSidebar"
        class="chat-sidebar chat-sidebar-left"
      >

        <div class="sidebar-header">

          <div class="sidebar-brand">

            <div class="sidebar-logo">
              🦁
            </div>

            <div>
              <strong>SalonePadi</strong>
              <span>AI</span>
            </div>

          </div>

          <button
            id="closeLeftSidebar"
            class="sidebar-close"
            type="button"
            aria-label="Close menu"
          >
            ×
          </button>

        </div>

        <div class="sidebar-content">

          <button
            id="newChatButton"
            class="new-chat-button"
            type="button"
          >
            <span class="new-chat-icon">＋</span>
            <span>New chat</span>
          </button>

          <div class="sidebar-section">

            <div class="sidebar-label">
              Recent chats
            </div>

            <div id="conversationList">
              <div class="conversation-empty">
                Loading chats...
              </div>
            </div>

          </div>

        </div>

        <div class="sidebar-footer">

          <button
            id="settingsButton"
            class="sidebar-action"
            type="button"
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>

          <button
            id="logoutButton"
            class="sidebar-action danger"
            type="button"
          >
            <span>↪</span>
            <span>Log out</span>
          </button>

          <div class="sidebar-user">

            <div class="sidebar-user-avatar">
              🦁
            </div>

            <div class="sidebar-user-info">

              <strong>
                ${escapeHTML(displayName)}
              </strong>

              <span>
                ${escapeHTML(user?.email || "")}
              </span>

            </div>

          </div>

        </div>

      </aside>

      <!-- =====================================================
           MAIN CHAT
           ===================================================== -->

      <section class="chat-main">

        <header class="chat-header">

          <button
            id="leftMenuButton"
            class="icon-button mobile-menu"
            type="button"
            aria-label="Open sidebar"
          >
            ☰
          </button>

          <div class="chat-brand">

            <div class="chat-logo">
              🦁
            </div>

            <div class="chat-brand-text">

              <strong>
                SalonePadi AI
              </strong>

              <span>
                Your personal AI padi
              </span>

            </div>

          </div>

          <div class="chat-header-actions">

            <button
              id="stopAudioButton"
              class="icon-button chat-audio-stop-button"
              type="button"
              aria-label="Stop audio"
              title="Stop audio"
            >
              ■
            </button>

            <button
              id="rightMenuButton"
              class="icon-button"
              type="button"
              aria-label="Open profile"
            >
              ⋯
            </button>

          </div>

        </header>

        <section class="chat-content">

          <div
            id="messages"
            class="chat-messages"
            aria-live="polite"
            aria-label="Conversation messages"
          ></div>

          <div
            id="chatStatus"
            class="chat-status"
            role="status"
            aria-live="polite"
          ></div>

        </section>

        <div class="composer-area">

          <form
            id="chatForm"
            class="chat-form"
          >

            <div class="composer">

              <textarea
                id="messageInput"
                rows="1"
                placeholder="Message SalonePadi AI..."
                autocomplete="off"
                required
              ></textarea>

              <button
                id="sendButton"
                class="send-button"
                type="submit"
                aria-label="Send message"
              >
                ↑
              </button>

            </div>

          </form>

          <div class="composer-note">
            SalonePadi AI can make mistakes.
            Check important information.
          </div>

        </div>

      </section>

      <!-- =====================================================
           RIGHT SIDEBAR
           ===================================================== -->

      <aside
        id="rightSidebar"
        class="chat-sidebar chat-sidebar-right"
      >

        <div class="right-sidebar-header">

          <strong>
            Profile
          </strong>

          <button
            id="closeRightSidebar"
            class="sidebar-close"
            type="button"
            aria-label="Close profile"
          >
            ×
          </button>

        </div>

        <div class="profile-card">

          <div class="profile-avatar">
            🦁
          </div>

          <h2>
            ${escapeHTML(displayName)}
          </h2>

          <p>
            ${escapeHTML(user?.email || "")}
          </p>

        </div>

        <div class="right-section">

          <div class="sidebar-label">
            Account
          </div>

          <button
            id="profileButton"
            class="sidebar-action"
            type="button"
          >
            <span>👤</span>
            <span>Profile</span>
          </button>

          <button
            id="settingsButtonRight"
            class="sidebar-action"
            type="button"
          >
            <span>⚙️</span>
            <span>Settings</span>
          </button>

        </div>

        <div class="right-section">

          <div class="sidebar-label">
            About SalonePadi
          </div>

          <p class="about-text">
            Your personal AI padi, built with Sierra Leonean
            spirit, technology and warmth. 🦁🇸🇱
          </p>

        </div>

      </aside>

      <div
        id="sidebarOverlay"
        class="sidebar-overlay"
      ></div>

    </main>
  `;

  /*
  |--------------------------------------------------------------------------
  | DOM REFERENCES
  |--------------------------------------------------------------------------
  */

  const $ = id =>
    document.getElementById(id);

  const messages =
    $("messages");

  const form =
    $("chatForm");

  const input =
    $("messageInput");

  const sendButton =
    $("sendButton");

  const status =
    $("chatStatus");

  const leftSidebar =
    $("leftSidebar");

  const rightSidebar =
    $("rightSidebar");

  const overlay =
    $("sidebarOverlay");

  const conversationList =
    $("conversationList");

  const stopAudioButton =
    $("stopAudioButton");

  /*
  |--------------------------------------------------------------------------
  | GLOBAL FORMATTER BRIDGE
  |--------------------------------------------------------------------------
  |
  | messages.js can use the existing formatter without importing this
  | controller and creating a circular dependency.
  |--------------------------------------------------------------------------
  */

  window.formatAIText =
    formatAIText;

  /*
  |--------------------------------------------------------------------------
  | UI HELPERS
  |--------------------------------------------------------------------------
  */

  function showStatus(
    message,
    isError = false
  ) {
    if (!status) {
      return;
    }

    status.textContent =
      message || "";

    status.classList.toggle(
      "chat-error",
      Boolean(isError)
    );
  }

  function closeSidebars() {
    leftSidebar?.classList.remove("open");
    rightSidebar?.classList.remove("open");
    overlay?.classList.remove("show");
  }

  function openSidebar(side) {
    closeSidebars();

    if (side === "left") {
      leftSidebar?.classList.add("open");
    }

    if (side === "right") {
      rightSidebar?.classList.add("open");
    }

    overlay?.classList.add("show");
  }

  function scrollMessages() {
    if (!messages) {
      return;
    }

    requestAnimationFrame(() => {
      messages.scrollTo({
        top: messages.scrollHeight,
        behavior: "smooth"
      });
    });
  }

  /*
  |--------------------------------------------------------------------------
  | SIDEBAR EVENTS
  |--------------------------------------------------------------------------
  */

  $("leftMenuButton")?.addEventListener(
    "click",
    () => openSidebar("left")
  );

  $("rightMenuButton")?.addEventListener(
    "click",
    () => openSidebar("right")
  );

  $("closeLeftSidebar")?.addEventListener(
    "click",
    closeSidebars
  );

  $("closeRightSidebar")?.addEventListener(
    "click",
    closeSidebars
  );

  overlay?.addEventListener(
    "click",
    closeSidebars
  );

  /*
  |--------------------------------------------------------------------------
  | AUDIO
  |--------------------------------------------------------------------------
  */

  stopAudioButton?.addEventListener(
    "click",
    event => {
      event.preventDefault();

      stopAudio();

      stopAudioButton.blur();
    }
  );

  /*
  |--------------------------------------------------------------------------
  | NEW CHAT
  |--------------------------------------------------------------------------
  */

  $("newChatButton")?.addEventListener(
    "click",
    async () => {
      await startNewChat();
    }
  );

  async function startNewChat() {
    try {
      state.setConversation(
        null,
        "New Chat"
      );

      stopAudio();

      messages.innerHTML = "";

      showStatus(
        "Starting a new chat..."
      );

      const conversation =
        await createConversation(
          api,
          "New Chat"
        );

      state.setConversation(
        conversation.id,
        conversation.title || "New Chat"
      );

      conversationTitleCache(
        conversation.id,
        conversation.title || "New Chat"
      );

      renderConversationList(
        await safeLoadConversations()
      );

      showStatus("");

      closeSidebars();

      input.focus();
    } catch (error) {
      console.error(
        "New chat error:",
        error
      );

      showStatus(
        error.message ||
        "Unable to start a new chat.",
        true
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SETTINGS / PROFILE
  |--------------------------------------------------------------------------
  */

  const placeholderButtons = [
    "settingsButton",
    "settingsButtonRight",
    "profileButton"
  ];

  for (const id of placeholderButtons) {
    const button =
      $(id);

    if (!button) {
      continue;
    }

    button.addEventListener(
      "click",
      () => {
        showStatus(
          "This section will be available soon."
        );

        closeSidebars();
      }
    );
  }

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  $("logoutButton")?.addEventListener(
    "click",
    async () => {

      const button =
        $("logoutButton");

      button.disabled =
        true;

      button.innerHTML = `
        <span>⏳</span>
        <span>Logging out...</span>
      `;

      try {
        stopAudio();
        await logout();
      } catch (error) {
        console.error(
          "Logout error:",
          error
        );
      } finally {
        window.location.hash =
          "#/login";
      }
    }
  );

  /*
  |--------------------------------------------------------------------------
  | COMPOSER
  |--------------------------------------------------------------------------
  */

  input.addEventListener(
    "input",
    resizeInput
  );

  input.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        form.requestSubmit();
      }
    }
  );

  function resizeInput() {
    input.style.height = "auto";

    input.style.height =
      `${Math.min(
        input.scrollHeight,
        180
      )}px`;
  }

  /*
  |--------------------------------------------------------------------------
  | SEND MESSAGE
  |--------------------------------------------------------------------------
  */

  form.addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      if (
        state.isSending ||
        !state.conversationId
      ) {
        return;
      }

      const message =
        input.value.trim();

      if (!message) {
        return;
      }

      input.value = "";
      input.style.height = "auto";

      addMessage(
        "user",
        message
      );

      setSending(true);

      try {
        const data =
          await api.post(
            `/api/chat/conversations/${state.conversationId}/messages`,
            {
              message
            }
          );

        const assistantContent =
          data?.message?.content ||
          data?.content ||
          "";

        if (!assistantContent) {
          throw new Error(
            "SalonePadi AI did not return a response."
          );
        }

        addMessage(
          "assistant",
          assistantContent
        );

        /*
         * Use the first user message to give an otherwise generic
         * conversation a useful name.
         */
        if (
          isGenericConversationTitle(
            state.conversationTitle
          )
        ) {
          const newTitle =
            buildDisplayTitle(
              message
            );

          state.setConversation(
            state.conversationId,
            newTitle
          );

          conversationTitleCache(
            state.conversationId,
            newTitle
          );

          updateConversationTitleInUI(
            state.conversationId,
            newTitle
          );
        }

        /*
         * Refresh the sidebar without creating another conversation.
         */
        const fresh =
          await safeLoadConversations();

        renderConversationList(
          fresh
        );
      } catch (error) {
        console.error(
          "Send message error:",
          error
        );

        showStatus(
          error.message ||
          "Unable to generate AI response.",
          true
        );
      } finally {
        setSending(false);
        input.focus();
      }
    }
  );

  function setSending(
    sending
  ) {
    state.isSending =
      Boolean(sending);

    sendButton.disabled =
      state.isSending;

    input.disabled =
      state.isSending;

    if (state.isSending) {
      sendButton.innerHTML = `
        <span class="typing-dots">
          <i></i>
          <i></i>
          <i></i>
        </span>
      `;

      showStatus(
        "SalonePadi AI is thinking..."
      );
    } else {
      sendButton.textContent =
        "↑";

      showStatus("");
    }
  }

  /*
  |--------------------------------------------------------------------------
  | INITIALIZATION
  |--------------------------------------------------------------------------
  */

  async function init() {
    try {
      showStatus(
        "Checking your session..."
      );

      await api.get(
        "/api/auth/me"
      );

      showStatus(
        "Loading your chats..."
      );

      /*
       * IMPORTANT FIX:
       *
       * Do NOT automatically create a new conversation on every page
       * load. That was the reason the Recent Chats list kept filling with
       * duplicate "New Chat" entries.
       */
      const conversations =
        await safeLoadConversations();

      if (
        conversations.length > 0
      ) {
        const first =
          conversations[0];

        const title =
          await getResolvedConversationTitle(
            first
          );

        state.setConversation(
          first.id,
          title
        );

        await loadMessages(
          first.id
        );

        renderConversationList(
          conversations
        );

      } else {
        const conversation =
          await createConversation(
            api,
            "New Chat"
          );

        state.setConversation(
          conversation.id,
          conversation.title || "New Chat"
        );

        conversationTitleCache(
          conversation.id,
          conversation.title || "New Chat"
        );

        messages.innerHTML = "";

        renderConversationList([
          conversation
        ]);
      }

      showStatus("");

      input.focus();

      /*
       * Optional feature modules are loaded after the core chat is ready.
       * A broken optional feature must not blank the entire UI.
       */
      const cleanup =
        await loadChatFeatures({
          api,
          state,
          user,
          displayName,
          elements: {
            root: container,
            messages,
            input,
            form,
            sendButton,
            status,
            leftSidebar,
            rightSidebar,
            overlay,
            conversationList
          },
          actions: {
            showStatus,
            startNewChat,
            loadMessages,
            loadConversations:
              safeLoadConversations,
            renderConversationList,
            deleteConversation:
              deleteConversationFromBackend,
            addMessage,
            stopAudio
          }
        });

      activeCleanup =
        cleanup;

    } catch (error) {
      console.error(
        "Chat initialization error:",
        error
      );

      if (
        /session|authentication|invalid|expired|unauthorized/i
          .test(
            error.message || ""
          )
      ) {
        window.location.hash =
          "#/login";

        return;
      }

      showStatus(
        error.message ||
        "Unable to load your chat.",
        true
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CONVERSATIONS
  |--------------------------------------------------------------------------
  */

  async function safeLoadConversations() {
    try {
      return await loadConversations(
        api
      );
    } catch (error) {
      console.warn(
        "Unable to load conversations:",
        error
      );

      return [];
    }
  }

  async function getResolvedConversationTitle(
    conversation
  ) {
    if (!conversation?.id) {
      return "New Chat";
    }

    const cached =
      getCachedConversationTitle(
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

    const serverTitle =
      conversation.title ||
      "";

    if (
      serverTitle &&
      !isGenericConversationTitle(
        serverTitle
      )
    ) {
      conversationTitleCache(
        conversation.id,
        serverTitle
      );

      return serverTitle;
    }

    /*
     * When the backend title is still "New Chat", look at the messages
     * and derive a useful display title from the first user message.
     */
    try {
      const data =
        await api.get(
          `/api/chat/conversations/${conversation.id}/messages`
        );

      const firstUser =
        (data?.messages || []).find(
          message =>
            message?.role ===
            "user" &&
            String(
              message?.content || ""
            ).trim()
        );

      if (firstUser) {
        const derived =
          buildDisplayTitle(
            firstUser.content
          );

        conversationTitleCache(
          conversation.id,
          derived
        );

        return derived;
      }
    } catch (error) {
      console.warn(
        "Unable to derive chat title:",
        error
      );
    }

    /*
     * Last-resort display name. This prevents an empty/undefined title.
     */
    return buildDisplayTitleFromDate(
      conversation.updated_at
    );
  }

  function renderConversationList(
    conversations
  ) {
    if (!conversationList) {
      return;
    }

    conversationList.innerHTML = "";

    if (
      !Array.isArray(conversations) ||
      conversations.length === 0
    ) {
      const empty =
        document.createElement(
          "div"
        );

      empty.className =
        "conversation-empty";

      empty.textContent =
        "No recent chats yet.";

      conversationList.appendChild(
        empty
      );

      return;
    }

    /*
     * Only show a manageable number of recent chats in the sidebar.
     * The backend can still contain more conversations.
     */
    const recent =
      conversations
        .slice()
        .sort(
          (a, b) =>
            new Date(
              b.updated_at || 0
            ) -
            new Date(
              a.updated_at || 0
            )
        )
        .slice(0, 25);

    for (
      const conversation of recent
    ) {
      const button =
        document.createElement(
          "button"
        );

      button.type =
        "button";

      button.className =
        "conversation-item";

      button.dataset.conversationId =
        conversation.id || "";

      if (
        conversation.id ===
        state.conversationId
      ) {
        button.classList.add(
          "active"
        );
      }

      const icon =
        document.createElement(
          "span"
        );

      icon.className =
        "conversation-icon";

      icon.textContent =
        "💬";

      const title =
        document.createElement(
          "span"
        );

      title.className =
        "conversation-title";

      const cached =
        getCachedConversationTitle(
          conversation.id
        );

      title.textContent =
        cached ||
        (
          isGenericConversationTitle(
            conversation.title
          )
            ? buildDisplayTitleFromDate(
                conversation.updated_at
              )
            : conversation.title
        );

      const deleteButton =
        document.createElement(
          "button"
        );

      deleteButton.type =
        "button";

      deleteButton.className =
        "conversation-delete-button";

      deleteButton.dataset.conversationDelete =
        conversation.id || "";

      deleteButton.title =
        "Delete chat";

      deleteButton.setAttribute(
        "aria-label",
        `Delete ${title.textContent || "chat"}`
      );

      deleteButton.textContent =
        "🗑️";

      button.append(
        icon,
        title,
        deleteButton
      );

      button.addEventListener(
        "click",
        async event => {
          if (
            event.target.closest(
              ".conversation-delete-button"
            )
          ) {
            return;
          }

          await switchConversation(
            conversation.id
          );
        }
      );

      deleteButton.addEventListener(
        "click",
        async event => {
          event.preventDefault();
          event.stopPropagation();

          await handleDeleteConversation(
            conversation.id,
            title.textContent
          );
        }
      );

      conversationList.appendChild(
        button
      );

      /*
       * If this chat still has a generic title, hydrate it in the
       * background so the UI is useful without delaying chat startup.
       */
      if (
        isGenericConversationTitle(
          conversation.title
        ) &&
        !cached
      ) {
        getResolvedConversationTitle(
          conversation
        ).then(resolved => {
          if (
            !resolved ||
            !conversation.id
          ) {
            return;
          }

          updateConversationTitleInUI(
            conversation.id,
            resolved
          );
        });
      }
    }
  }

  async function handleDeleteConversation(
    id,
    title
  ) {
    if (!id) {
      return;
    }

    const safeTitle =
      String(
        title || "this chat"
      ).trim() ||
      "this chat";

    const confirmed =
      window.confirm(
        `Delete "${safeTitle}"? This will remove the conversation from your account.`
      );

    if (!confirmed) {
      return;
    }

    try {
      stopAudio();

      showStatus(
        "Deleting chat..."
      );

      await deleteConversationFromBackend(
        id
      );

      /*
       * If the deleted chat is currently open, immediately create a fresh
       * backend conversation so the composer never points at a deleted ID.
       */
      if (
        id === state.conversationId
      ) {
        state.setConversation(
          null,
          "New Chat"
        );

        messages.innerHTML = "";

        const fresh =
          await createConversation(
            api,
            "New Chat"
          );

        state.setConversation(
          fresh.id,
          fresh.title || "New Chat"
        );

        conversationTitleCache(
          fresh.id,
          fresh.title || "New Chat"
        );
      }

      const freshList =
        await safeLoadConversations();

      renderConversationList(
        freshList
      );

      showStatus("");

      closeSidebars();

      input.focus();
    } catch (error) {
      console.error(
        "Delete conversation error:",
        error
      );

      showStatus(
        error.message ||
        "Unable to delete this chat.",
        true
      );
    }
  }

  async function deleteConversationFromBackend(
    id
  ) {
    /*
     * IMPORTANT:
     * This is a real backend operation.
     * Do not replace it with localStorage-only deletion.
     */
    return deleteConversation(
      api,
      id
    );
  }

  async function switchConversation(
    id
  ) {
    if (!id) {
      return;
    }

    if (
      id === state.conversationId
    ) {
      closeSidebars();
      input.focus();
      return;
    }

    try {
      stopAudio();

      closeSidebars();

      showStatus(
        "Loading conversation..."
      );

      const conversations =
        await safeLoadConversations();

      const target =
        conversations.find(
          conversation =>
            conversation.id === id
        );

      const title =
        await getResolvedConversationTitle(
          target || { id }
        );

      state.setConversation(
        id,
        title
      );

      await loadMessages(id);

      renderConversationList(
        conversations
      );

      showStatus("");

      input.focus();
    } catch (error) {
      console.error(
        "Conversation switch error:",
        error
      );

      showStatus(
        error.message ||
        "Unable to load conversation.",
        true
      );
    }
  }

  async function loadMessages(
    id = state.conversationId
  ) {
    if (!id) {
      return;
    }

    const data =
      await api.get(
        `/api/chat/conversations/${id}/messages`
      );

    messages.innerHTML = "";

    const messageList =
      Array.isArray(data?.messages)
        ? data.messages
        : [];

    for (
      const message of messageList
    ) {
      addMessage(
        message.role,
        message.content
      );
    }

    scrollMessages();
  }

  /*
  |--------------------------------------------------------------------------
  | MESSAGE RENDERING
  |--------------------------------------------------------------------------
  */

  function addMessage(
    role,
    content
  ) {
    try {
      const result =
        renderMessage(
          messages,
          role,
          content,
          displayName
        );

      if (result) {
        wireMessageActions(
          result,
          role,
          content
        );

        scrollMessages();

        return result;
      }
    } catch (error) {
      console.warn(
        "messages.js renderer failed; using safe fallback:",
        error
      );
    }

    return renderFallbackMessage(
      role,
      content
    );
  }

  function renderFallbackMessage(
    role,
    content
  ) {
    const isAssistant =
      role === "assistant" ||
      role === "ai";

    const row =
      document.createElement(
        "div"
      );

    row.className =
      isAssistant
        ? "message-row message-row-ai"
        : "message-row message-row-user";

    const avatar =
      document.createElement(
        "div"
      );

    avatar.className =
      "message-avatar";

    avatar.textContent =
      isAssistant
        ? "🦁"
        : "You";

    const bubble =
      document.createElement(
        "div"
      );

    bubble.className =
      isAssistant
        ? "message-bubble ai-message"
        : "message-bubble user-message";

    if (isAssistant) {
      bubble.innerHTML = `
        <div class="message-name">
          SalonePadi AI
        </div>

        <div class="message-text">
          ${formatAIText(content)}
        </div>

        <div class="message-actions"></div>
      `;

      const actions =
        bubble.querySelector(
          ".message-actions"
        );

      if (actions) {
        const audioButton =
          createAudioButton(
            String(content ?? "")
          );

        if (audioButton) {
          actions.appendChild(
            audioButton
          );
        }
      }
    } else {
      bubble.innerHTML = `
        <div class="message-text">
          ${escapeHTML(content)}
        </div>
      `;
    }

    row.append(
      avatar,
      bubble
    );

    messages.appendChild(
      row
    );

    wireMessageActions(
      row,
      role,
      content
    );

    scrollMessages();

    return row;
  }

  function wireMessageActions(
    row,
    role,
    content
  ) {
    if (!row) {
      return;
    }

    /*
     * Audio fallback: if messages.js did not create one, add it here.
     */
    if (
      role === "assistant" ||
      role === "ai"
    ) {
      const existing =
        row.querySelector(
          ".message-audio-button"
        );

      if (!existing) {
        let actions =
          row.querySelector(
            ".message-actions"
          );

        if (!actions) {
          const bubble =
            row.querySelector(
              ".message-bubble"
            );

          if (bubble) {
            actions =
              document.createElement(
                "div"
              );

            actions.className =
              "message-actions";

            bubble.appendChild(
              actions
            );
          }
        }

        if (actions) {
          try {
            const audioButton =
              createAudioButton(
                String(content ?? "")
              );

            if (audioButton) {
              actions.appendChild(
                audioButton
              );
            }
          } catch (error) {
            console.warn(
              "Audio button creation failed:",
              error
            );
          }
        }
      }
    }

    /*
     * Copy buttons.
     */
    row
      .querySelectorAll(
        ".code-copy-button"
      )
      .forEach(button => {
        if (
          button.dataset.copyBound ===
          "true"
        ) {
          return;
        }

        button.dataset.copyBound =
          "true";

        button.addEventListener(
          "click",
          async event => {
            event.preventDefault();

            const code =
              button
                .closest(".code-block")
                ?.querySelector("code")
                ?.textContent ||
              "";

            try {
              await copyText(code);

              const oldText =
                button.textContent;

              button.textContent =
                "Copied ✓";

              setTimeout(() => {
                button.textContent =
                  oldText;
              }, 1600);
            } catch (error) {
              console.warn(
                "Code copy failed:",
                error
              );

              button.textContent =
                "Copy failed";

              setTimeout(() => {
                button.textContent =
                  "Copy";
              }, 1600);
            }
          }
        );
      });
  }

  /*
  |--------------------------------------------------------------------------
  | DIALOG-SAFE TITLE HELPERS
  |--------------------------------------------------------------------------
  */

  function updateConversationTitleInUI(
    id,
    title
  ) {
    if (!conversationList || !id) {
      return;
    }

    const button =
      conversationList.querySelector(
        `[data-conversation-id="${cssEscape(id)}"]`
      );

    const titleElement =
      button?.querySelector(
        ".conversation-title"
      );

    if (titleElement) {
      titleElement.textContent =
        title;
    }
  }

  function isGenericConversationTitle(
    title
  ) {
    const normalized =
      String(title || "")
        .trim()
        .toLowerCase();

    return (
      !normalized ||
      normalized === "new chat" ||
      normalized === "new conversation"
    );
  }

  function conversationTitleCache(
    id,
    title
  ) {
    if (!id || !title) {
      return;
    }

    rememberConversationTitle(
      user,
      id,
      title
    );
  }

  function getCachedConversationTitle(
    id
  ) {
    if (!id || !user?.id) {
      return null;
    }

    try {
      const key =
        `salonepadi_conversation_titles_${user.id}`;

      const raw =
        localStorage.getItem(key);

      if (!raw) {
        return null;
      }

      const data =
        JSON.parse(raw);

      return (
        typeof data?.[id] === "string"
          ? data[id]
          : null
      );
    } catch {
      return null;
    }
  }

  function buildDisplayTitleFromDate(
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

  /*
  |--------------------------------------------------------------------------
  | CODE / MARKDOWN FORMATTER
  |--------------------------------------------------------------------------
  */

  function formatAIText(
    value
  ) {
    let text =
      String(value ?? "");

    const codeBlocks = [];

    text =
      text.replace(
        /```([\w+#.-]*)\n?([\s\S]*?)```/g,
        (
          match,
          language,
          code
        ) => {
          const index =
            codeBlocks.length;

          const cleanCode =
            String(code || "")
              .replace(
                /\r\n/g,
                "\n"
              )
              .replace(
                /\r/g,
                "\n"
              )
              .replace(
                /^\n/,
                ""
              )
              .replace(
                /\n$/,
                ""
              );

          let highlightedCode;

          try {
            if (
              window.hljs &&
              language &&
              typeof window.hljs.getLanguage ===
                "function" &&
              window.hljs.getLanguage(
                language
              )
            ) {
              highlightedCode =
                window.hljs.highlight(
                  cleanCode,
                  {
                    language
                  }
                ).value;
            } else if (
              window.hljs &&
              typeof window.hljs.highlightAuto ===
                "function"
            ) {
              highlightedCode =
                window.hljs.highlightAuto(
                  cleanCode
                ).value;
            } else {
              highlightedCode =
                escapeHTML(
                  cleanCode
                );
            }
          } catch (error) {
            console.warn(
              "Code highlighting failed:",
              error
            );

            highlightedCode =
              escapeHTML(
                cleanCode
              );
          }

          codeBlocks.push(`
            <div class="code-block">

              <div class="code-header">

                <span class="code-language">
                  ${escapeHTML(
                    language || "code"
                  )}
                </span>

                <button
                  type="button"
                  class="code-copy-button"
                  aria-label="Copy code"
                >
                  Copy
                </button>

              </div>

              <pre><code>${highlightedCode}</code></pre>

            </div>
          `);

          return `@@CODE_BLOCK_${index}@@`;
        }
      );

    text =
      escapeHTML(text);

    text =
      text.replace(
        /\*\*([\s\S]*?)\*\*/g,
        "<strong>$1</strong>"
      );

    text =
      text.replace(
        /`([^`\n]+)`/g,
        '<code class="inline-code">$1</code>'
      );

    text =
      text.replace(
        /^### (.+)$/gm,
        "<h4>$1</h4>"
      );

    text =
      text.replace(
        /^## (.+)$/gm,
        "<h3>$1</h3>"
      );

    text =
      text.replace(
        /^# (.+)$/gm,
        "<h2>$1</h2>"
      );

    text =
      text.replace(
        /^[ \t]*[-*•] (.+)$/gm,
        '<div class="markdown-list-item"><span>•</span><span>$1</span></div>'
      );

    text =
      text.replace(
        /^[ \t]*(\d+)\. (.+)$/gm,
        '<div class="markdown-number-item"><span>$1.</span><span>$2</span></div>'
      );

    text =
      text.replace(
        /https?:\/\/[^\s<]+/g,
        url => {
          let cleanURL =
            url;

          let trailing =
            "";

          while (
            /[.,!?;:)\]}]$/.test(
              cleanURL
            )
          ) {
            trailing =
              cleanURL.slice(-1) +
              trailing;

            cleanURL =
              cleanURL.slice(
                0,
                -1
              );
          }

          return `
            <a
              class="ai-link"
              href="${escapeAttribute(
                cleanURL
              )}"
              target="_blank"
              rel="noopener noreferrer"
            >${escapeHTML(
              cleanURL
            )}</a>${escapeHTML(
              trailing
            )}
          `;
        }
      );

    text =
      text.replace(
        /(^|[^*])\*([^*\n]+)\*(?!\*)/g,
        "$1<em>$2</em>"
      );

    text =
      text.replace(
        /\n/g,
        "<br>"
      );

    codeBlocks.forEach(
      (
        block,
        index
      ) => {
        text =
          text.replace(
            `@@CODE_BLOCK_${index}@@`,
            block
          );
      }
    );

    return text;
  }

  /*
  |--------------------------------------------------------------------------
  | UTILITY HELPERS
  |--------------------------------------------------------------------------
  */

  function escapeHTML(
    value
  ) {
    return String(
      value ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }

  function escapeAttribute(
    value
  ) {
    return escapeHTML(
      value
    );
  }

  function cssEscape(
    value
  ) {
    const string =
      String(value ?? "");

    if (
      window.CSS &&
      typeof window.CSS.escape ===
        "function"
    ) {
      return window.CSS.escape(
        string
      );
    }

    return string.replace(
      /[^a-zA-Z0-9_-]/g,
      character =>
        `\\${character}`
    );
  }

  async function copyText(
    text
  ) {
    const value =
      String(text ?? "");

    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText ===
        "function"
    ) {
      await navigator.clipboard.writeText(
        value
      );

      return;
    }

    const area =
      document.createElement(
        "textarea"
      );

    area.value =
      value;

    area.style.position =
      "fixed";

    area.style.opacity =
      "0";

    area.style.pointerEvents =
      "none";

    document.body.appendChild(
      area
    );

    area.focus();
    area.select();

    try {
      const copied =
        document.execCommand(
          "copy"
        );

      if (!copied) {
        throw new Error(
          "Copy command failed."
        );
      }
    } finally {
      area.remove();
    }
  }

  /*
  |--------------------------------------------------------------------------
  | INITIALIZE
  |--------------------------------------------------------------------------
  */

  await init();

  /*
  |--------------------------------------------------------------------------
  | CLEANUP
  |--------------------------------------------------------------------------
  */

  activeCleanup = () => {
    try {
      stopAudio();
    } catch {
      // Ignore audio cleanup errors.
    }

    if (
      window.formatAIText ===
      formatAIText
    ) {
      try {
        delete window.formatAIText;
      } catch {
        window.formatAIText =
          undefined;
      }
    }

    state.destroy();
  };
}
