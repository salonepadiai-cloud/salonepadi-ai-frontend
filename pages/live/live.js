// JOHNNY TEC OS — pages/live/live.js
//
// Voice-only Live Conversation. No transcript, no typing — tap the
// orb to talk, the AI replies out loud. Two engines, switchable from
// the settings icon:
//   - "browser": SpeechRecognition + SpeechSynthesis (default, always
//     available).
//   - "gemini": streams mic audio to our /ws/live relay -> Gemini
//     Live API (beta) and plays its audio replies back.
//
// Any failure (Gemini connect timeout, mic error, expired session)
// shows as a real toast message and — for Gemini — automatically
// falls back to the browser engine rather than leaving a dead orb.

if (!AuthService.isAuthenticated()) {
  window.location.href = '../../auth/login/login.html';
}

const orb = document.getElementById('live-orb');
const tickRing = document.getElementById('tick-ring');
const waveLeft = document.getElementById('wave-left');
const waveRight = document.getElementById('wave-right');
const statusTitle = document.getElementById('status-title');
const statusSubtitle = document.getElementById('status-subtitle');
const backBtn = document.getElementById('back-btn');
const voiceSettingsBtn = document.getElementById('voice-settings-btn');

let conversationId = null;
let recognition = null;
let listening = false;
let busy = false; // true while thinking or speaking — orb tap is ignored

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechSupported = !!SpeechRecognitionAPI;
const ttsSupported = 'speechSynthesis' in window;

// Build the rotating tick-mark ring used in the "speaking" state.
(function buildTickRing() {
  const count = 28;
  for (let i = 0; i < count; i++) {
    const tick = document.createElement('span');
    tick.style.transform = `rotate(${(360 / count) * i}deg) translateY(-60px)`;
    tick.style.animationDelay = `${(i % 6) * 0.1}s`;
    tickRing.appendChild(tick);
  }
})();

backBtn.addEventListener('click', leaveLiveConversation);

function leaveLiveConversation() {
  if (recognition) recognition.abort();
  if (ttsSupported) speechSynthesis.cancel();
  stopGeminiLive();
  stopVisualizer();
  window.location.href = '../../index.html';
}

// ---- Toast (shared component from global.css) ----
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

// ---- Orb / status state ----
function setState(state) {
  orb.className = `big-orb big-orb--${state}`;
  waveLeft.classList.toggle('is-active', state === 'listening');
  waveRight.classList.toggle('is-active', state === 'listening');

  const copy = {
    idle: ['Ready and waiting for you...', 'Tap the orb to start talking.'],
    listening: ['I\u2019m listening...', 'Speak naturally.'],
    thinking: ['One moment...', 'Johnny is thinking.'],
    speaking: ['Talking', 'Johnny is speaking...'],
  }[state];

  statusTitle.textContent = copy[0];
  statusSubtitle.textContent = copy[1];
}

// ---- Core: send a recognized utterance to the backend, speak the reply ----
async function handleUtterance(text) {
  if (!text.trim() || busy) return;
  stopListening();
  setState('thinking');
  busy = true;

  try {
    if (!conversationId) {
      const conversation = await ChatService.createConversation(ChatService.deriveTitle(text));
      conversationId = conversation.id;
    }
    const data = await ChatService.sendMessage(conversationId, text);
    speak(data.message.content);
  } catch (err) {
    if (err.status === 401) {
      AuthService.clearSession();
      showToast('Session expired \u2014 redirecting to log in...');
      setState('idle');
      busy = false;
      setTimeout(() => { window.location.href = '../../auth/login/login.html'; }, 1200);
      return;
    }
    showToast(err.message || 'Something went wrong.');
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
  utter.onend = () => { busy = false; setState('idle'); };
  utter.onerror = () => { busy = false; setState('idle'); };
  setState('speaking');
  speechSynthesis.speak(utter);
}

// ---- Browser speech recognition ----
function startListening() {
  if (!speechSupported || busy) return;

  recognition = new SpeechRecognitionAPI();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (e) => {
    let finalText = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
    }
    if (finalText) handleUtterance(finalText);
  };

  recognition.onerror = () => {
    listening = false;
    stopVisualizer();
    if (!busy) setState('idle');
  };

  recognition.onend = () => {
    listening = false;
    stopVisualizer();
    if (!busy) setState('idle');
  };

  recognition.start();
  listening = true;
  setState('listening');
  startVisualizer();
}

function stopListening() {
  if (recognition && listening) recognition.stop();
  listening = false;
  stopVisualizer();
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

// ---- Orb tap: dispatches to whichever engine is selected ----
orb.addEventListener('click', () => {
  if (busy) return;

  if (getEngine() === 'gemini') {
    if (geminiActive) stopGeminiLive();
    else startGeminiLive();
    return;
  }

  if (!speechSupported) {
    showToast('Voice input isn\u2019t supported in this browser.');
    return;
  }
  if (listening) stopListening();
  else startListening();
});

/*
|--------------------------------------------------------------------------
| REAL AUDIO-REACTIVE WAVEFORM (listening state)
|--------------------------------------------------------------------------
|
| A separate, lightweight mic tap purely for visualization — actual
| amplitude from the microphone, not a decorative loop. Independent
| of SpeechRecognition (which doesn't expose raw audio) and of the
| Gemini engine's own mic capture.
|
*/

let vizStream = null;
let vizContext = null;
let vizAnalyser = null;
let vizRafId = null;

function startVisualizer() {
  if (getEngine() === 'gemini') return; // Gemini engine drives bars from its own PCM stream instead.

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      vizStream = stream;
      vizContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = vizContext.createMediaStreamSource(stream);
      vizAnalyser = vizContext.createAnalyser();
      vizAnalyser.fftSize = 64;
      source.connect(vizAnalyser);
      drawWaveform();
    })
    .catch(() => {
      // Visualization is a bonus, not required — recognition still works without it.
    });
}

function stopVisualizer() {
  if (vizRafId) cancelAnimationFrame(vizRafId);
  vizRafId = null;
  if (vizStream) { vizStream.getTracks().forEach((t) => t.stop()); vizStream = null; }
  if (vizContext) { try { vizContext.close(); } catch (_) {} vizContext = null; }
  vizAnalyser = null;
  resetWaveformBars();
}

function resetWaveformBars() {
  document.querySelectorAll('.waveform span').forEach((bar) => { bar.style.height = '4px'; });
}

function drawWaveform() {
  if (!vizAnalyser) return;
  const data = new Uint8Array(vizAnalyser.frequencyBinCount);
  vizAnalyser.getByteFrequencyData(data);

  const bars = document.querySelectorAll('.waveform span');
  const step = Math.floor(data.length / bars.length) || 1;
  bars.forEach((bar, i) => {
    const value = data[i * step] || 0;
    const height = 4 + (value / 255) * 60;
    bar.style.height = `${height}px`;
  });

  vizRafId = requestAnimationFrame(drawWaveform);
}

// Drive the same waveform bars from Gemini's real outgoing PCM chunks.
function updateWaveformFromPCM(int16Array) {
  let sum = 0;
  for (let i = 0; i < int16Array.length; i++) sum += Math.abs(int16Array[i]);
  const avg = sum / int16Array.length; // 0..32768
  const height = 4 + Math.min(1, avg / 6000) * 60;

  document.querySelectorAll('.waveform span').forEach((bar, i) => {
    // Slight per-bar variance so it doesn't look perfectly uniform.
    const jitter = 1 + ((i % 3) - 1) * 0.15;
    bar.style.height = `${Math.max(4, height * jitter)}px`;
  });
}

/*
|--------------------------------------------------------------------------
| GEMINI LIVE (beta)
|--------------------------------------------------------------------------
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
  setState('listening');
  waveLeft.classList.add('is-active');
  waveRight.classList.add('is-active');

  let setupConfirmed = false;

  const connectTimeout = setTimeout(() => {
    if (!setupConfirmed) {
      showToast('Gemini Live didn\u2019t respond in time \u2014 falling back to browser voice.');
      stopGeminiLive();
      startListening();
    }
  }, 6000);

  geminiSocket = new WebSocket(url);

  geminiSocket.addEventListener('open', () => {
    const setupMessage = {
      setup: {
        model: 'models/gemini-3.1-flash-live-preview',
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
      }
    }

    if (payload.serverContent && payload.serverContent.turnComplete && geminiActive) {
      setState('listening');
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
    waveLeft.classList.remove('is-active');
    waveRight.classList.remove('is-active');

    if (!wasConfirmed) {
      showToast(
        `Gemini Live couldn\u2019t connect (code ${event.code}${event.reason ? ': ' + event.reason : ''}) \u2014 falling back to browser voice.`
      );
      if (!busy) startListening();
      return;
    }

    if (!busy) setState('idle');
  });

  geminiSocket.addEventListener('error', () => {
    // 'close' fires next and handles cleanup/fallback.
  });
}

function stopGeminiLive() {
  if (!geminiActive && !geminiSocket) return;
  geminiActive = false;
  waveLeft.classList.remove('is-active');
  waveRight.classList.remove('is-active');
  stopMicStreaming();
  stopPlaybackQueue();
  if (geminiSocket) {
    try { geminiSocket.close(); } catch (_) {}
    geminiSocket = null;
  }
  if (!busy) setState('idle');
}

function startMicStreaming() {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      if (!geminiActive) {
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
        updateWaveformFromPCM(pcm16);
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
      showToast('Microphone access failed \u2014 falling back to browser voice.');
      stopGeminiLive();
      startListening();
    });
}

function stopMicStreaming() {
  if (micProcessor) { micProcessor.disconnect(); micProcessor = null; }
  if (micSource) { micSource.disconnect(); micSource = null; }
  if (micStream) { micStream.getTracks().forEach((t) => t.stop()); micStream = null; }
  if (micAudioContext) { micAudioContext.close(); micAudioContext = null; }
  resetWaveformBars();
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
    try { playbackContext.close(); } catch (_) {}
    playbackContext = null;
  }
  playbackQueueTime = 0;
}

// ---- Startup ----
if (!speechSupported && getEngine() === 'browser') {
  showToast('Voice input isn\u2019t supported in this browser. Try Gemini Live in settings.');
}
setState('idle');
