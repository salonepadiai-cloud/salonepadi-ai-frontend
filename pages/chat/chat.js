// JOHNNY TEC OS — pages/chat/chat.js

if (!AuthService.isAuthenticated()) {
  window.location.href = '../../auth/login/login.html';
}

const screen = document.getElementById('chat-screen');
const input = document.getElementById('chat-input');
const sendBtn = document.getElementById('chat-send');
const backBtn = document.getElementById('back-btn');

let conversationId = null;
let sending = false;

backBtn.addEventListener('click', () => {
  window.location.href = '../../index.html';
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

function appendAIMessage(text, createdAt) {
  const el = document.createElement('div');
  el.className = 'msg msg--ai';
  el.innerHTML = `
    <div class="orb msg__avatar"><span class="eye"></span><span class="eye"></span></div>
    <div class="msg__col">
      <div class="msg__bubble"></div>
      <div class="msg__meta"><span>${formatTime(createdAt)}</span></div>
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

async function ensureConversation() {
  if (conversationId) return conversationId;
  const conversation = await ChatService.createConversation();
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
    const id = await ensureConversation();
    const data = await ChatService.sendMessage(id, text);
    removeThinking();
    finalizeUserMessage(userEl, data.userMessage?.created_at);
    appendAIMessage(data.message.content, data.message?.created_at);
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

// If the person typed a message on the home screen before landing here,
// pick it up and send it immediately.
const pending = sessionStorage.getItem('jt_pending_message');
if (pending) {
  sessionStorage.removeItem('jt_pending_message');
  renderEmptyState();
  sendMessage(pending);
} else {
  renderEmptyState();
}
