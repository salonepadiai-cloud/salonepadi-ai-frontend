// JOHNNY TEC OS — pages/chat/chat.js

if (!AuthService.isAuthenticated()) {
  window.location.href = '../../auth/login/login.html';
}

const screen = document.getElementById('chat-screen');
const input = document.getElementById('chat-input');
const sendBtn = document.getElementById('chat-send');
const backBtn = document.getElementById('back-btn');
const newChatBtn = document.getElementById('new-chat-btn');

let conversationId = null;
let sending = false;

const AI_PROVIDER_KEY = 'jt_ai_provider';

function getSelectedProvider() {
  return localStorage.getItem(AI_PROVIDER_KEY) || 'groq';
}

function setSelectedProvider(provider) {
  localStorage.setItem(AI_PROVIDER_KEY, provider);
  renderProviderBar();
}

function renderProviderBar() {
  const current = getSelectedProvider();
  document.querySelectorAll('.provider-pill').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.provider === current);
  });
}

document.querySelectorAll('.provider-pill').forEach((btn) => {
  btn.addEventListener('click', () => setSelectedProvider(btn.dataset.provider));
});

renderProviderBar();

const urlParams = new URLSearchParams(window.location.search);
const openConversationId = urlParams.get('id');

backBtn.addEventListener('click', () => {
  window.location.href = '../../index.html';
});

newChatBtn.addEventListener('click', () => {
  conversationId = null;
  dayDividerShown = false;
  history.replaceState(null, '', 'chat.html');
  renderEmptyState();
});

const STARTER_PROMPTS = [
  'What can you help me with?',
  'Summarize a piece of text',
  'Help me write something',
];

function renderEmptyState() {
  screen.innerHTML = `
    <div class="welcome-card">
      <div class="orb" style="width:40px;height:40px; flex-shrink:0;">
        <span class="eye"></span><span class="eye"></span>
      </div>
      <div>
        <div class="welcome-card__title">${CONFIG.APP_NAME}</div>
        <div class="welcome-card__status" id="welcome-status" style="color:var(--text-muted);"><span class="welcome-card__status-dot" style="background:var(--text-muted);"></span>Checking...</div>
        <div class="welcome-card__desc">Your personal AI assistant. Ask me anything!</div>
      </div>
    </div>
    <div class="chip-row" id="starter-chips">
      ${STARTER_PROMPTS.map((p) => `<button class="chip" data-prompt="${p}">${p}</button>`).join('')}
    </div>
  `;
  document.querySelectorAll('#starter-chips .chip').forEach((chip) => {
    chip.addEventListener('click', () => sendMessage(chip.dataset.prompt));
  });
  checkBackendStatus();
}

async function checkBackendStatus() {
  const statusEl = document.getElementById('welcome-status');
  if (!statusEl) return;
  try {
    await apiRequest('/api/health');
    statusEl.style.color = 'var(--status-good)';
    statusEl.innerHTML = `<span class="welcome-card__status-dot" style="background:var(--status-good);"></span>Online`;
  } catch (_) {
    statusEl.style.color = 'var(--status-bad)';
    statusEl.innerHTML = `<span class="welcome-card__status-dot" style="background:var(--status-bad);"></span>Offline`;
  }
}

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function scrollToBottom() {
  screen.scrollTop = screen.scrollHeight;
}

let dayDividerShown = false;

function maybeShowDayDivider() {
  if (dayDividerShown) return;
  dayDividerShown = true;
  const el = document.createElement('div');
  el.className = 'day-divider';
  el.textContent = 'Today';
  screen.appendChild(el);
}

function appendUserMessage(text) {
  document.querySelector('.welcome-card')?.remove();
  document.getElementById('starter-chips')?.remove();
  maybeShowDayDivider();

  const el = document.createElement('div');
  el.className = 'msg msg--user';
  el.innerHTML = `
    <div class="msg__col">
      <div class="msg__bubble"></div>
      <div class="msg__meta"></div>
    </div>
  `;
  el.querySelector('.msg__bubble').textContent = text;
  screen.appendChild(el);
  scrollToBottom();
  return el;
}

function finalizeUserMessage(el, createdAt) {
  const meta = el.querySelector('.msg__meta');
  meta.innerHTML = `<span>${formatTime(createdAt)}</span><span class="check">\u2713</span>`;
}

function appendThinking() {
  const el = document.createElement('div');
  el.className = 'msg msg--ai is-thinking';
  el.id = 'thinking-msg';
  el.innerHTML = `
    <div class="orb msg__avatar"><span class="eye"></span><span class="eye"></span></div>
    <div class="msg__bubble">Johnny is thinking...</div>
  `;
  screen.appendChild(el);
  scrollToBottom();
}

function removeThinking() {
  document.getElementById('thinking-msg')?.remove();
}

function appendAIMessage(text, createdAt, provider) {
  const el = document.createElement('div');
  el.className = 'msg msg--ai';
  const providerLabel = provider ? ` \u00b7 via ${provider}` : '';
  el.innerHTML = `
    <div class="orb msg__avatar"><span class="eye"></span><span class="eye"></span></div>
    <div class="msg__col">
      <div class="msg__bubble"></div>
      <div class="msg__meta"><span>${formatTime(createdAt)}${providerLabel}</span></div>
    </div>
  `;
  el.querySelector('.msg__bubble').textContent = text;
  screen.appendChild(el);
  scrollToBottom();
}

function appendErrorMessage(text) {
  const el = document.createElement('div');
  el.className = 'msg msg--ai msg--error';
  el.innerHTML = `<div class="msg__bubble"></div>`;
  el.querySelector('.msg__bubble').textContent = text;
  screen.appendChild(el);
  scrollToBottom();
}

async function loadConversationHistory(id) {
  screen.innerHTML = `
    <div class="chat-empty">
      <div class="orb" style="width:48px;height:48px;">
        <span class="eye"></span><span class="eye"></span>
      </div>
      <p>Loading conversation...</p>
    </div>
  `;

  try {
    const data = await apiRequest(`/api/chat/conversations/${id}/messages`, { auth: true });
    const messages = data.messages || [];

    screen.innerHTML = '';
    dayDividerShown = false;

    if (messages.length === 0) {
      renderEmptyState();
      return;
    }

    maybeShowDayDivider();
    messages.forEach((m) => {
      if (m.role === 'user') {
        const el = appendUserMessage(m.content);
        finalizeUserMessage(el, m.created_at);
      } else {
        appendAIMessage(m.content, m.created_at);
      }
    });
  } catch (err) {
    if (err.status === 401) {
      AuthService.clearSession();
      window.location.href = '../../auth/login/login.html';
      return;
    }
    screen.innerHTML = `<div class="chat-empty"><p>Couldn't load this conversation: ${err.message}</p></div>`;
  }
}

async function ensureConversation(firstMessageText) {
  if (conversationId) return conversationId;
  const conversation = await ChatService.createConversation(ChatService.deriveTitle(firstMessageText));
  conversationId = conversation.id;
  return conversationId;
}

async function sendMessage(text) {
  if (sending || !text.trim()) return;
  sending = true;
  sendBtn.disabled = true;

  const userEl = appendUserMessage(text);
  appendThinking();

  try {
    const id = await ensureConversation(text);
    const provider = getSelectedProvider();
    const data = await ChatService.sendMessage(id, text, provider);
    removeThinking();
    finalizeUserMessage(userEl, data.userMessage?.created_at);
    appendAIMessage(data.message.content, data.message?.created_at, provider);
  } catch (err) {
    removeThinking();
    if (err.status === 401) {
      AuthService.clearSession();
      appendErrorMessage('Your session expired. Redirecting to log in...');
      setTimeout(() => { window.location.href = '../../auth/login/login.html'; }, 1200);
      return;
    }
    appendErrorMessage(err.message || 'Something went wrong.');
  } finally {
    sending = false;
    sendBtn.disabled = false;
  }
}

sendBtn.addEventListener('click', () => {
  const text = input.value;
  input.value = '';
  sendMessage(text);
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendBtn.click();
  }
});

// Priority: open an existing conversation (from sidebar tap) > a pending
// message typed on home > a fresh empty chat.
if (openConversationId) {
  conversationId = openConversationId;
  loadConversationHistory(openConversationId);
} else {
  const pending = sessionStorage.getItem('jt_pending_message');
  if (pending) {
    sessionStorage.removeItem('jt_pending_message');
    renderEmptyState();
    sendMessage(pending);
  } else {
    renderEmptyState();
  }
}
