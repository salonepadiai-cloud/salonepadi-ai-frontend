// JOHNNY TEC OS — pages/live/live.js
// Uses the browser's built-in SpeechRecognition + SpeechSynthesis APIs.
// No fake voice processing — if the browser doesn't support one of
// these, we say so and fall back to typing.

if (!AuthService.isAuthenticated()) {
  window.location.href = '../../auth/login/login.html';
}

const orb = document.getElementById('live-orb');
const waveLeft = document.getElementById('wave-left');
const waveRight = document.getElementById('wave-right');
const statusTitle = document.getElementById('status-title');
const statusSubtitle = document.getElementById('status-subtitle');
const interimText = document.getElementById('interim-text');
const transcript = document.getElementById('live-transcript');
const endBtn = document.getElementById('end-btn');
const micBtn = document.getElementById('mic-btn');
const micLabel = document.getElementById('mic-label');
const typeToggleBtn = document.getElementById('type-toggle-btn');
const typeBar = document.getElementById('type-bar');
const typeInput = document.getElementById('type-input');
const typeSend = document.getElementById('type-send');
const backBtn = document.getElementById('back-btn');

let conversationId = null;
let recognition = null;
let listening = false;
let busy = false; // true while thinking or speaking — mic is locked out

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechSupported = !!SpeechRecognitionAPI;
const ttsSupported = 'speechSynthesis' in window;

backBtn.addEventListener('click', leaveLiveConversation);
endBtn.addEventListener('click', leaveLiveConversation);

function leaveLiveConversation() {
  if (recognition) recognition.abort();
  if (ttsSupported) speechSynthesis.cancel();
  window.location.href = '../../index.html';
}

// ---- Orb / status state ----
function setState(state) {
  orb.className = `orb live-orb live-orb--${state}`;
  waveLeft.classList.toggle('is-active', state === 'listening');
  waveRight.classList.toggle('is-active', state === 'listening');

  const copy = {
    idle: ['Tap the mic to start', 'Speak naturally, Johnny is here to help.'],
    listening: ["Listening...", 'Speak now — tap the mic again to stop.'],
    thinking: ['Johnny is thinking...', 'One moment.'],
    speaking: ['Speaking...', 'Tap the mic to interrupt and reply.'],
  }[state];

  statusTitle.textContent = copy[0];
  statusSubtitle.textContent = copy[1];
  endBtn.style.display = state === 'idle' ? 'none' : 'flex';
}

// ---- Transcript rendering (reuses .msg styles from chat.css) ----
function clearEmptyState() {
  const empty = transcript.querySelector('.live-empty');
  if (empty) empty.remove();
}

function appendUserMessage(text) {
  clearEmptyState();
  const el = document.createElement('div');
  el.className = 'msg msg--user';
  el.innerHTML = `<div class="msg__bubble"></div>`;
  el.querySelector('.msg__bubble').textContent = text;
  transcript.appendChild(el);
  transcript.scrollTop = transcript.scrollHeight;
}

function appendAIMessage(text) {
  const el = document.createElement('div');
  el.className = 'msg msg--ai';
  el.innerHTML = `<div class="orb msg__avatar"><span class="eye"></span><span class="eye"></span></div><div class="msg__bubble"></div>`;
  el.querySelector('.msg__bubble').textContent = text;
  transcript.appendChild(el);
  transcript.scrollTop = transcript.scrollHeight;
}

function appendErrorMessage(text) {
  const el = document.createElement('div');
  el.className = 'msg msg--ai msg--error';
  el.innerHTML = `<div class="msg__bubble"></div>`;
  el.querySelector('.msg__bubble').textContent = text;
  transcript.appendChild(el);
  transcript.scrollTop = transcript.scrollHeight;
}

// ---- Core: send an utterance (from voice OR typing) to the backend ----
async function handleUtterance(text) {
  if (!text.trim() || busy) return;
  stopListening();
  interimText.textContent = '';
  appendUserMessage(text);
  setState('thinking');
  busy = true;

  try {
    if (!conversationId) {
      const conversation = await ChatService.createConversation(ChatService.deriveTitle(text));
      conversationId = conversation.id;
    }
    const data = await ChatService.sendMessage(conversationId, text);
    appendAIMessage(data.message.content);
    speak(data.message.content);
  } catch (err) {
    if (err.status === 401) {
      AuthService.clearSession();
      appendErrorMessage('Your session expired. Redirecting to log in...');
      setState('idle');
      busy = false;
      setTimeout(() => { window.location.href = '../../auth/login/login.html'; }, 1200);
      return;
    }
    appendErrorMessage(err.message || 'Something went wrong.');
    busy = false;
    setState('idle');
  }
}

function speak(text) {
  if (!ttsSupported) {
    busy = false;
    setState('idle');
    return;
  }
  speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.onend = () => {
    busy = false;
    setState('idle');
  };
  utter.onerror = () => {
    busy = false;
    setState('idle');
  };
  setState('speaking');
  speechSynthesis.speak(utter);
}

// ---- Speech recognition ----
function startListening() {
  if (!speechSupported || busy) return;

  recognition = new SpeechRecognitionAPI();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onresult = (e) => {
    let finalText = '';
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const chunk = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += chunk;
      else interim += chunk;
    }
    interimText.textContent = interim;
    if (finalText) handleUtterance(finalText);
  };

  recognition.onerror = () => {
    listening = false;
    micBtn.classList.remove('is-active');
    micLabel.textContent = 'Tap to speak';
    if (!busy) setState('idle');
  };

  recognition.onend = () => {
    listening = false;
    micBtn.classList.remove('is-active');
    micLabel.textContent = 'Tap to speak';
    if (!busy) setState('idle');
  };

  recognition.start();
  listening = true;
  micBtn.classList.add('is-active');
  micLabel.textContent = 'Listening...';
  setState('listening');
}

function stopListening() {
  if (recognition && listening) recognition.stop();
  listening = false;
  micBtn.classList.remove('is-active');
  micLabel.textContent = 'Tap to speak';
}

micBtn.addEventListener('click', () => {
  if (!speechSupported) return;
  if (listening) stopListening();
  else startListening();
});

// ---- Typing fallback ----
typeToggleBtn.addEventListener('click', () => {
  typeBar.classList.toggle('is-visible');
  if (typeBar.classList.contains('is-visible')) typeInput.focus();
});

typeSend.addEventListener('click', submitTyped);
typeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); submitTyped(); }
});

function submitTyped() {
  const text = typeInput.value.trim();
  if (!text) return;
  typeInput.value = '';
  handleUtterance(text);
}

// ---- Startup ----
if (!speechSupported) {
  micBtn.disabled = true;
  micLabel.textContent = 'Not supported';
  statusTitle.textContent = 'Voice input isn\u2019t supported in this browser';
  statusSubtitle.textContent = 'Use Type Instead below.';
  typeBar.classList.add('is-visible');
} else {
  setState('idle');
}
