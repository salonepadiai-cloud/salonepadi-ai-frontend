import { authenticated, currentUser, logout } from "../auth.js";
import { api } from "../api.js";

let conversationId = null;

export async function renderChat(container) {
  if (!authenticated()) {
    window.location.hash = "#/login";
    return;
  }

  const user = currentUser();

  container.innerHTML = `
    <main class="chat-app">
      <aside id="leftSidebar" class="chat-sidebar chat-sidebar-left">
        <div class="sidebar-top">
          <button id="newChatButton" class="new-chat-button" type="button">
            <span>＋</span><span>New chat</span>
          </button>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-label">SalonePadi AI</div>
          <button class="conversation-item active" type="button">
            <span class="conversation-icon">💬</span>
            <span class="conversation-title">New conversation</span>
          </button>
        </div>

        <div class="sidebar-spacer"></div>

        <div class="sidebar-bottom">
          <button id="settingsButton" class="sidebar-action" type="button">
            <span>⚙️</span><span>Settings</span>
          </button>
          <button id="logoutButton" class="sidebar-action danger" type="button">
            <span>↪</span><span>Log out</span>
          </button>
        </div>
      </aside>

      <section class="chat-main">
        <header class="chat-header">
          <button id="leftMenuButton" class="icon-button mobile-menu" type="button">☰</button>

          <div class="chat-brand">
            <div class="chat-logo">🦁</div>
            <div class="chat-brand-text">
              <strong>SalonePadi AI</strong>
              <span>Your personal AI padi</span>
            </div>
          </div>

          <button id="rightMenuButton" class="icon-button" type="button">⋯</button>
        </header>

        <section class="chat-content">
          <div id="messages" class="chat-messages"></div>
          <div id="chatStatus" class="chat-status"></div>
        </section>

        <div class="composer-area">
          <form id="chatForm" class="chat-form">
            <div class="composer">
              <textarea id="messageInput" rows="1"
                placeholder="Message SalonePadi AI..."
                autocomplete="off" required></textarea>
              <button id="sendButton" class="send-button" type="submit">↑</button>
            </div>
          </form>
          <div class="composer-note">
            SalonePadi AI can make mistakes. Check important information.
          </div>
        </div>
      </section>

      <aside id="rightSidebar" class="chat-sidebar chat-sidebar-right">
        <div class="profile-card">
          <div class="profile-avatar">🦁</div>
          <h2>${escapeHTML(user?.user_metadata?.name || user?.name || "User")}</h2>
          <p>${escapeHTML(user?.email || "")}</p>
        </div>

        <div class="right-section">
          <div class="sidebar-label">Account</div>
          <button id="profileButton" class="sidebar-action" type="button">
            <span>👤</span><span>Profile</span>
          </button>
          <button id="settingsButtonRight" class="sidebar-action" type="button">
            <span>⚙️</span><span>Settings</span>
          </button>
        </div>

        <div class="right-section">
          <div class="sidebar-label">About</div>
          <p class="about-text">
            Your personal AI padi, built with Sierra Leonean spirit.
          </p>
        </div>
      </aside>

      <div id="sidebarOverlay" class="sidebar-overlay"></div>
    </main>
  `;

  const messages = document.getElementById("messages");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("messageInput");
  const sendButton = document.getElementById("sendButton");
  const status = document.getElementById("chatStatus");
  const logoutButton = document.getElementById("logoutButton");
  const leftSidebar = document.getElementById("leftSidebar");
  const rightSidebar = document.getElementById("rightSidebar");
  const overlay = document.getElementById("sidebarOverlay");

  function closeSidebars() {
    leftSidebar.classList.remove("open");
    rightSidebar.classList.remove("open");
    overlay.classList.remove("show");
  }

  function openSidebar(side) {
    closeSidebars();
    (side === "left" ? leftSidebar : rightSidebar).classList.add("open");
    overlay.classList.add("show");
  }

  document.getElementById("leftMenuButton").addEventListener("click", () => openSidebar("left"));
  document.getElementById("rightMenuButton").addEventListener("click", () => openSidebar("right"));
  overlay.addEventListener("click", closeSidebars);

  document.getElementById("newChatButton").addEventListener("click", async () => {
    closeSidebars();
    messages.innerHTML = "";
    conversationId = null;
    try {
      showStatus("Starting a new chat...");
      await createConversation();
      showStatus("");
      input.focus();
    } catch (error) {
      showStatus(error.message || "Unable to start a new chat.", true);
    }
  });

  for (const id of ["settingsButton", "settingsButtonRight", "profileButton"]) {
    document.getElementById(id).addEventListener("click", () => {
      showStatus("This section will be available soon.");
      closeSidebars();
    });
  }

  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    logoutButton.textContent = "Logging out...";
    try {
      await logout();
    } finally {
      window.location.hash = "#/login";
    }
  });

  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  try {
    showStatus("Checking your session...");
    await api.get("/api/auth/me");
    showStatus("Starting your chat...");
    await createConversation();
    await loadMessages();
    showStatus("");
    input.focus();
  } catch (error) {
    console.error("Chat initialization error:", error);
    if (/session|authentication|invalid/i.test(error.message || "")) {
      localStorage.removeItem("salonepadi_access_token");
      localStorage.removeItem("salonepadi_user");
      window.location.hash = "#/login";
      return;
    }
    showStatus(error.message || "Unable to load your chat.", true);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message || !conversationId) return;

    input.value = "";
    input.style.height = "auto";
    addMessage("user", message);
    setSending(true);

    try {
      const data = await api.post(
        `/api/chat/conversations/${conversationId}/messages`,
        { message }
      );
      if (data.message?.content) addMessage("assistant", data.message.content);
    } catch (error) {
      showStatus(error.message || "Unable to generate AI response.", true);
    } finally {
      setSending(false);
      input.focus();
    }
  });

  async function createConversation() {
    const data = await api.post("/api/chat/conversations", { title: "New Chat" });
    if (!data.conversation?.id) {
      throw new Error("The server did not return a conversation.");
    }
    conversationId = data.conversation.id;
  }

  async function loadMessages() {
    if (!conversationId) return;
    const data = await api.get(`/api/chat/conversations/${conversationId}/messages`);
    messages.innerHTML = "";
    for (const message of data.messages || []) addMessage(message.role, message.content);
  }

  function addMessage(role, content) {
    const row = document.createElement("div");
    row.className = `message-row ${role === "user" ? "message-row-user" : "message-row-ai"}`;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = role === "user" ? "You" : "🦁";

    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${role === "user" ? "user-message" : "ai-message"}`;

    bubble.innerHTML = role === "assistant"
      ? `<div class="message-name">SalonePadi AI</div><div class="message-text">${escapeHTML(content)}</div>`
      : `<div class="message-text">${escapeHTML(content)}</div>`;

    row.append(avatar, bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function setSending(sending) {
    input.disabled = sending;
    sendButton.disabled = sending;
    sendButton.textContent = sending ? "…" : "↑";
  }

  function showStatus(message, isError = false) {
    status.textContent = message;
    status.className = isError ? "chat-status chat-error" : "chat-status";
  }

  function escapeHTML(value) {
    const element = document.createElement("div");
    element.textContent = String(value ?? "");
    return element.innerHTML;
  }
}
