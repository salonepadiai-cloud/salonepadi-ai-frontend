// JOHNNY TEC OS — pages/live/live.js

window.addEventListener('error', (e) => {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = `JS Error: ${e.message} (line ${e.lineno})`;
    toast.classList.add('is-visible');
    toast.style.pointerEvents = 'auto';
  }
  console.error('Live page error:', e.error || e.message);
});

//
// Voice-only Live Conversation. No transcript, no typing — tap the
// orb to talk, the AI replies out loud. The orb itself is a real
// canvas-rendered rotating dot-sphere (Fibonacci sphere distribution,
// depth-shaded), not a static image or CSS gradient trick.
//
// Two engines, switchable from the settings icon:
//   - "browser": SpeechRecognition + SpeechSynthesis (default).
//   - "gemini": streams mic audio to our /ws/live relay -> Gemini
//     Live API (beta) and plays its audio replies back.
//
// Any failure shows as a toast, and Gemini failures auto-fall-back
// to the browser engine.

if (!AuthService.isAuthenticated()) {
  window.location.href = '../../auth/login/login.html';
}

const orbEl = document.getElementById('live-orb');
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
let currentState = 'idle';

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechSupported = !!SpeechRecognitionAPI;
const ttsSupported = 'speechSynthesis' in window;

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
  currentState = state;
  orbEl.className = `big-orb big-orb--${state}`;
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

/*
|--------------------------------------------------------------------------
| CANVAS DOT-SPHERE
|--------------------------------------------------------------------------
|
| A real rotating 3D point-sphere (Fibonacci distribution for even dot
| spacing), rendered every frame — not a static asset. Depth (post-
| rotation Z) drives each dot's size/brightness so the far hemisphere
| naturally fades, giving the same "glowing wireframe globe" look as
| the reference. Rotation speed and color respond to the actual
| conversation state, and while listening, speed also responds to
| real microphone amplitude.
|
*/

const canvas = document.getElementById('orb-canvas');
const ctx = canvas.getContext('2d');
let dpr = window.devicePixelRatio || 1;
let orbSize = 0;

const SPHERE_POINTS = buildFibonacciSphere(420);
let rotationY = 0;
let rotationX = 0.15;
let lastFrameTime = performance.now();
let currentAmplitude = 0; // 0..1, set by the visualizer/PCM stream while listening

function buildFibonacciSphere(count) {
  const points = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    points.push({
      x: Math.cos(theta) * radiusAtY,
      y,
      z: Math.sin(theta) * radiusAtY,
    });
  }
  return points;
}

function resizeCanvas() {
  const rect = orbEl.getBoundingClientRect();
  orbSize = rect.width;
  dpr = window.devicePixelRatio || 1;
  canvas.width = orbSize * dpr;
  canvas.height = orbSize * dpr;
  canvas.style.width = `${orbSize}px`;
  canvas.style.height = `${orbSize}px`;
}
window.addEventListener('resize', resizeCanvas);

function stateColor() {
  // [r, g, b] for the "near side" bright dots, per state.
  if (currentState === 'speaking') return [216, 180, 254]; // violet
  if (currentState === 'thinking') return [148, 197, 255]; // soft blue
  return [125, 211, 252]; // cyan-blue (idle/listening)
}

function renderSphere(now) {
  const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
  lastFrameTime = now;

  // Rotation speed per state — reactive to real mic amplitude while listening.
  let speed = 0.25; // idle: slow ambient spin
  if (currentState === 'listening') speed = 0.35 + currentAmplitude * 1.8;
  else if (currentState === 'thinking') speed = 0.6;
  else if (currentState === 'speaking') speed = 0.9;

  rotationY += speed * dt;
  rotationX = 0.15 + Math.sin(now / 4000) * 0.05;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, orbSize, orbSize);

  const cx = orbSize / 2;
  const cy = orbSize / 2;
  const R = orbSize * 0.42;
  const [r, g, b] = stateColor();

  const cosY = Math.cos(rotationY), sinY = Math.sin(rotationY);
  const cosX = Math.cos(rotationX), sinX = Math.sin(rotationX);

  // Depth-sort so near-side dots draw on top of far-side dots.
  const projected = SPHERE_POINTS.map((p) => {
    // Rotate around Y axis, then around X axis.
    const x1 = p.x * cosY + p.z * sinY;
    const z1 = -p.x * sinY + p.z * cosY;
    const y1 = p.y * cosX - z1 * sinX;
    const z2 = p.y * sinX + z1 * cosX;
    return { x: x1, y: y1, z: z2 };
  });
  projected.sort((a, b2) => a.z - b2.z);

  for (const p of projected) {
    const depth = (p.z + 1) / 2; // 0 (far) .. 1 (near)
    const size = 0.6 + depth * 2.1;
    const alpha = 0.08 + depth * 0.85;

    ctx.beginPath();
    ctx.arc(cx + p.x * R, cy + p.y * R, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.fill();
  }

  requestAnimationFrame(renderSphere);
}

resizeCanvas();
requestAnimationFrame(renderSphere);

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
  waveLeft.classList.add('waveform--decorative');
  waveRight.classList.add('waveform--decorative');
  startVisualizer();
}

function stopListening() {
  if (recognition && listening) recognition.stop();
  listening = false;
  waveLeft.classList.remove('waveform--decorative');
  waveRight.classList.remove('waveform--decorative');
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
orbEl.addEventListener('click', () => {
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
| WAVEFORM VISUALIZATION (listening state)
|--------------------------------------------------------------------------
|
| IMPORTANT: for the browser engine, this does NOT open its own
| microphone stream. An earlier version did (via getUserMedia, to
| drive real amplitude), running at the same time SpeechRecognition
| was also trying to capture the mic internally — two simultaneous
| mic consumers, which silently broke SpeechRecognition on-device
| (it never fired onresult/onend, so the orb stayed stuck on
| "Listening..." forever). For browser voice, the waveform bars are
| now a decorative CSS animation only — not claimed to be reactive.
|
| The Gemini engine still gets REAL audio-reactive bars, because
| that reuses the PCM stream it already needs for functionality —
| not a second, redundant mic consumer.
|
*/

function startVisualizer() {
  // Browser engine: decorative only (see note above — no mic access here).
}

function stopVisualizer() {
  currentAmplitude = 0;
  resetWaveformBars();
}

function resetWaveformBars() {
  document.querySelectorAll('.waveform span').forEach((bar) => { bar.style.height = '4px'; });
}

// Drive the waveform bars + sphere amplitude from Gemini's real outgoing PCM chunks.
function updateWaveformFromPCM(int16Array) {
  let sum = 0;
  for (let i = 0; i < int16Array.length; i++) sum += Math.abs(int16Array[i]);
  const avg = sum / int16Array.length; // 0..32768
  const level = Math.min(1, avg / 6000);
  currentAmplitude = level;
  const height = 4 + level * 60;

  document.querySelectorAll('.waveform span').forEach((bar, i) => {
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
  currentAmplitude = 0;
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
  const ctx2 = getPlaybackContext();
  const rateMatch = /rate=(\d+)/.exec(mimeType || '');
  const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;

  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const int16 = new Int16Array(bytes.buffer);

  const audioBuffer = ctx2.createBuffer(1, int16.length, sampleRate);
  const channel = audioBuffer.getChannelData(0);
  for (let i = 0; i < int16.length; i++) channel[i] = int16[i] / 32768;

  const source = ctx2.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx2.destination);

  const now = ctx2.currentTime;
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
