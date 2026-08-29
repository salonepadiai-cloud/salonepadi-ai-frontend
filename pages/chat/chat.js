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

function renderEmptyState() {
  screen.innerHTML = `
    <div class="chat-empty">
      <div class="orb" style="width:48px;height:48px;">
        <span class="eye"></span><span class="eye"></span>
      </div>
      <p>Ask Johnny anything to start a new conversation.</p>
    </div>
  `;
}

function scrollToBottom() {
  screen.scrollTop = screen.scrollHeight;
}

function appendUserMessage(text) {
  if (screen.querySelector('.chat-empty')) screen.innerHTML = '';
  const el = document.createElement('div');
  el.className = 'msg msg--user';
  el.innerHTML = `<div class="msg__bubble"></div>`;
  el.querySelector('.msg__bubble').textContent = text;
  screen.appendChild(el);
  scrollToBottom();
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

function appendAIMessage(text) {
  const el = document.createElement('div');
  el.className = 'msg msg--ai';
  el.innerHTML = `<div class="orb msg__avatar"><span class="eye"></span><span class="eye"></span></div><div class="msg__bubble"></div>`;
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

  appendUserMessage(text);
  appendThinking();

  try {
    const id = await ensureConversation();
    const data = await ChatService.sendMessage(id, text);
    removeThinking();
    appendAIMessage(data.message.content);
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
