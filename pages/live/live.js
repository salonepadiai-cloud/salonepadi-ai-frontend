// JOHNNY TEC OS — pages/live/live.js
//
// Two voice engines:
//   - "browser": the original SpeechRecognition + SpeechSynthesis
//     implementation. Always available, always the safe fallback.
//   - "gemini": streams raw mic audio to our backend's /ws/live
//     relay, which forwards it to Gemini's Live API (beta) and
//     streams audio replies back.
//
// The Gemini Live wire protocol is assembled from Google's public
// docs, which are for a preview API and can be incomplete or drift.
// Every failure path here (connect timeout, close-before-setup,
// mic error) falls back to the browser engine automatically instead
// of leaving the person stuck, and every failure is shown as a real
// message in the transcript so it can be debugged from what
// actually happened, not guessed.

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
const voiceSettingsBtn = document.getElementById('voice-settings-btn');

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
  stopGeminiLive();
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
  clearEmptyState();
  const el = document.createElement('div');
  el.className = 'msg msg--ai';
  el.innerHTML = `<div class="orb msg__avatar"><span class="eye"></span><span class="eye"></span></div><div class="msg__bubble"></div>`;
  el.querySelector('.msg__bubble').textContent = text;
  transcript.appendChild(el);
  transcript.scrollTop = transcript.scrollHeight;
}

function appendErrorMessage(text) {
  clearEmptyState();
  const el = document.createElement('div');
  el.className = 'msg msg--ai msg--error';
  el.innerHTML = `<div class="msg__bubble"></div>`;
  el.querySelector('.msg__bubble').textContent = text;
  transcript.appendChild(el);
  transcript.scrollTop = transcript.scrollHeight;
}

// ---- Core: send a typed/browser-recognized utterance to the backend ----
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

// ---- Browser speech recognition (unchanged from before) ----
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

// ---- Voice engine selection ----
const ENGINE_KEY = 'jt_voice_engine';

function getEngine() {
  return localStorage.getItem(ENGINE_KEY) || 'browser';
}

function setEngine(engine) {
  localStorage.setItem(ENGINE_KEY, engine);
}

voiceSettingsBtn.addEventListener('click', showEngineSheet);

function showEngineSheet() {
  const current = getEngine();
  const overlay = document.createElement('div');
  overlay.className = 'action-sheet-overlay';
  overlay.innerHTML = `
    <div class="action-sheet">
      <div class="action-sheet__title">Voice engine</div>
      <button class="action-sheet__btn" id="engine-browser">${current === 'browser' ? '\u2713 ' : ''}Browser voice</button>
      <button class="action-sheet__btn" id="engine-gemini">${current === 'gemini' ? '\u2713 ' : ''}Gemini Live (beta)</button>
      <button class="action-sheet__btn" id="engine-cancel">Cancel</button>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#engine-browser').onclick = () => { setEngine('browser'); overlay.remove(); };
  overlay.querySelector('#engine-gemini').onclick = () => { setEngine('gemini'); overlay.remove(); };
  overlay.querySelector('#engine-cancel').onclick = () => overlay.remove();
}

// ---- Mic button: dispatches to whichever engine is selected ----
micBtn.addEventListener('click', () => {
  if (getEngine() === 'gemini') {
    if (geminiActive) stopGeminiLive();
    else startGeminiLive();
    return;
  }
  if (!speechSupported) return;
  if (listening) stopListening();
  else startListening();
});

// ---- Typing fallback (works with either engine) ----
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

/*
|--------------------------------------------------------------------------
| GEMINI LIVE (beta)
|--------------------------------------------------------------------------
|
| Continuous mic streaming while a session is active — this is a
| different model than browser SpeechRecognition's tap-per-utterance
| flow, since Gemini Live has its own voice activity detection.
|
*/

let geminiSocket = null;
let geminiActive = false;
let micStream = null;
let micAudioContext = null;
let micSource = null;
let micProcessor = null;
let playbackContext = null;
let playbackQueueTime = 0;

function wsUrlFromApiBase(path) {
  const httpUrl = new URL(path, CONFIG.API_BASE_URL);
  httpUrl.protocol = httpUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  return httpUrl.toString();
}

function startGeminiLive() {
  if (geminiActive || busy) return;

  const token = AuthService.getToken();
  const url = wsUrlFromApiBase(`/ws/live?token=${encodeURIComponent(token)}`);

  geminiActive = true;
  micBtn.classList.add('is-active');
  micLabel.textContent = 'Connecting...';
  setState('listening');

  let setupConfirmed = false;

  const connectTimeout = setTimeout(() => {
    if (!setupConfirmed) {
      appendErrorMessage('Gemini Live didn\u2019t respond in time \u2014 falling back to browser voice.');
      stopGeminiLive();
      startListening();
    }
  }, 6000);

  geminiSocket = new WebSocket(url);

  geminiSocket.addEventListener('open', () => {
    const setupMessage = {
      setup: {
        model: 'models/gemini-2.0-flash-live-preview-04-09',
        generationConfig: { responseModalities: ['AUDIO'] },
      },
    };
    geminiSocket.send(JSON.stringify(setupMessage));
  });

  geminiSocket.addEventListener('message', async (event) => {
    let payload;
    try {
      const text = typeof event.data === 'string' ? event.data : await event.data.text();
      payload = JSON.parse(text);
    } catch (_) {
      return;
    }

    if (payload.setupComplete) {
      setupConfirmed = true;
      clearTimeout(connectTimeout);
      micLabel.textContent = 'Listening...';
      startMicStreaming();
      return;
    }

    const modelTurn = payload.serverContent && payload.serverContent.modelTurn;
    if (modelTurn && modelTurn.parts) {
      for (const part of modelTurn.parts) {
        if (part.inlineData && part.inlineData.data) {
          setState('speaking');
          playAudioChunk(part.inlineData.data, part.inlineData.mimeType);
        }
        if (part.text) {
          appendAIMessage(part.text);
        }
      }
    }

    if (payload.serverContent && payload.serverContent.turnComplete) {
      if (geminiActive) {
        setState('listening');
        micLabel.textContent = 'Listening...';
      }
    }

    if (payload.serverContent && payload.serverContent.interrupted) {
      stopPlaybackQueue();
    }
  });

  geminiSocket.addEventListener('close', (event) => {
    clearTimeout(connectTimeout);
    const wasConfirmed = setupConfirmed;
    stopMicStreaming();
    geminiActive = false;
    micBtn.classList.remove('is-active');

    if (!wasConfirmed) {
      appendErrorMessage(
        `Gemini Live couldn\u2019t connect (code ${event.code}${event.reason ? ': ' + event.reason : ''}) \u2014 falling back to browser voice.`
      );
      if (!busy) startListening();
      return;
    }

    micLabel.textContent = 'Tap to speak';
    if (!busy) setState('idle');
  });

  geminiSocket.addEventListener('error', () => {
    // The 'close' event fires right after this and handles cleanup/fallback.
  });
}

function stopGeminiLive() {
  if (!geminiActive && !geminiSocket) return;
  geminiActive = false;
  micBtn.classList.remove('is-active');
  micLabel.textContent = 'Tap to speak';
  stopMicStreaming();
  stopPlaybackQueue();
  if (geminiSocket) {
    try { geminiSocket.close(); } catch (_) { /* already closed */ }
    geminiSocket = null;
  }
  if (!busy) setState('idle');
}

// ---- Mic capture: Float32 -> PCM16 @16kHz -> base64 -> relay ----
function startMicStreaming() {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      if (!geminiActive) {
        // Session was stopped while the permission prompt was open.
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      micStream = stream;
      micAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      micSource = micAudioContext.createMediaStreamSource(stream);
      micProcessor = micAudioContext.createScriptProcessor(4096, 1, 1);

      micProcessor.onaudioprocess = (e) => {
        if (!geminiActive || !geminiSocket || geminiSocket.readyState !== WebSocket.OPEN) return;
        const input = e.inputBuffer.getChannelData(0);
        const pcm16 = floatTo16BitPCM(input);
        const base64 = arrayBufferToBase64(pcm16.buffer);
        geminiSocket.send(
          JSON.stringify({
            realtimeInput: {
              mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: base64 }],
            },
          })
        );
      };

      micSource.connect(micProcessor);
      micProcessor.connect(micAudioContext.destination);
    })
    .catch((err) => {
      appendErrorMessage('Microphone access failed: ' + err.message + ' \u2014 falling back to browser voice.');
      stopGeminiLive();
      startListening();
    });
}

function stopMicStreaming() {
  if (micProcessor) { micProcessor.disconnect(); micProcessor = null; }
  if (micSource) { micSource.disconnect(); micSource = null; }
  if (micStream) { micStream.getTracks().forEach((t) => t.stop()); micStream = null; }
  if (micAudioContext) { micAudioContext.close(); micAudioContext = null; }
}

function floatTo16BitPCM(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0, offset = 0; i < float32Array.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Int16Array(buffer);
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// ---- Playback of Gemini's streamed audio replies ----
function getPlaybackContext() {
  if (!playbackContext) {
    playbackContext = new (window.AudioContext || window.webkitAudioContext)();
    playbackQueueTime = playbackContext.currentTime;
  }
  return playbackContext;
}

function playAudioChunk(base64Data, mimeType) {
  const ctx = getPlaybackContext();
  const rateMatch = /rate=(\d+)/.exec(mimeType || '');
  const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;

  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const int16 = new Int16Array(bytes.buffer);

  const audioBuffer = ctx.createBuffer(1, int16.length, sampleRate);
  const channel = audioBuffer.getChannelData(0);
  for (let i = 0; i < int16.length; i++) channel[i] = int16[i] / 32768;

  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);

  const now = ctx.currentTime;
  const startAt = Math.max(now, playbackQueueTime);
  source.start(startAt);
  playbackQueueTime = startAt + audioBuffer.duration;
}

function stopPlaybackQueue() {
  if (playbackContext) {
    try { playbackContext.close(); } catch (_) { /* already closed */ }
    playbackContext = null;
  }
  playbackQueueTime = 0;
}

// ---- Startup ----
if (!speechSupported && getEngine() === 'browser') {
  micLabel.textContent = 'Not supported';
  statusTitle.textContent = 'Voice input isn\u2019t supported in this browser';
  statusSubtitle.textContent = 'Use Type Instead below, or switch to Gemini Live in Voice Settings.';
  typeBar.classList.add('is-visible');
} else {
  setState('idle');
}
