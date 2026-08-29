// JOHNNY TEC OS — app.js
// Layer 1: static shell only. No backend calls live here yet.
// Once we confirm real endpoints, home stats / activity get their
// own fetch logic — nothing here is placeholder-dressed-as-real-data.

// Layer 2: require a real session before showing the app.
if (!AuthService.isAuthenticated()) {
  window.location.href = 'auth/login/login.html';
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function renderHome() {
  const app = document.getElementById('app');
  const user = AuthService.getUser();
  const firstName = (user?.user_metadata?.name || user?.email || '').split(' ')[0].split('@')[0];

  app.innerHTML = `
    <header class="top-bar">
      <div class="top-bar__left">
        <div class="orb" style="width:36px;height:36px;">
          <span class="eye"></span><span class="eye"></span>
        </div>
        <div>
          <div class="top-bar__title">${CONFIG.APP_NAME}</div>
          <div class="top-bar__subtitle">Your AI Assistant</div>
        </div>
      </div>
      <div class="top-bar__right" style="display:flex; gap:4px;">
        <button class="top-bar__icon-btn" aria-label="Notifications">
          ${iconBell()}
        </button>
        <button class="top-bar__icon-btn" id="logout-btn" aria-label="Log out">
          ${iconLogout()}
        </button>
      </div>
    </header>

    <main class="screen">
      <div class="greeting">
        <h1>${timeGreeting()}${firstName ? ', ' + firstName : ''} 👋</h1>
        <p>How can I help you today?</p>
      </div>

      <div class="ask-box">
        <input type="text" id="home-input" placeholder="Ask Johnny anything..." />
        <button class="ask-box__mic" aria-label="Voice input">${iconMic()}</button>
        <button class="ask-box__send" id="home-send" aria-label="Send">${iconSend()}</button>
      </div>

      <div class="quick-actions">
        ${quickAction('Summarize', iconDoc())}
        ${quickAction('Write', iconPen())}
        ${quickAction('Code', iconCode())}
        ${quickAction('Analyze', iconBars())}
      </div>

      <section class="card">
        <div class="section-header"><h2>System Status</h2></div>
        <div id="system-status" class="empty-state">Checking...</div>
      </section>

      <section class="card">
        <div class="section-header"><h2>Today's Overview</h2></div>
        <div class="empty-state">Connect the backend to load your stats.</div>
      </section>

      <section class="card">
        <div class="section-header"><h2>Recent Activity</h2></div>
        <div id="recent-activity" class="empty-state">Loading...</div>
      </section>
    </main>

    <nav class="bottom-nav">
      ${navItem('Home', iconHome(), true)}
      <button class="bottom-nav__item" onclick="goToChat()">${iconChat()}<span>Chat</span></button>
      <div class="bottom-nav__orb-btn orb" style="width:52px;height:52px; cursor:pointer;" onclick="goToLive()">
        <span class="eye"></span><span class="eye"></span>
      </div>
      ${navItem('Tools', iconTools(), false)}
      ${navItem('Profile', iconProfile(), false)}
    </nav>
  `;

  document.getElementById('home-send').addEventListener('click', submitHomeInput);
  document.getElementById('home-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); submitHomeInput(); }
  });
}

function submitHomeInput() {
  const input = document.getElementById('home-input');
  const text = input.value.trim();
  if (!text) return;
  sessionStorage.setItem('jt_pending_message', text);
  goToChat();
}

function goToChat() {
  window.location.href = 'pages/chat/chat.html';
}

function goToLive() {
  window.location.href = 'pages/live/live.html';
}

function quickAction(label, icon) {
  return `<button class="quick-action">${icon}<span>${label}</span></button>`;
}

function navItem(label, icon, active) {
  return `<button class="bottom-nav__item ${active ? 'is-active' : ''}">${icon}<span>${label}</span></button>`;
}

// ---- Minimal inline icon set (no external icon font yet) ----
function iconBell() { return svg('<path d="M12 2a6 6 0 0 0-6 6v3.5L4 15h16l-2-3.5V8a6 6 0 0 0-6-6Z"/><path d="M9.5 19a2.5 2.5 0 0 0 5 0"/>'); }
function iconMic() { return svg('<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v4"/>'); }
function iconSend() { return svg('<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4Z"/>'); }
function iconDoc() { return svg('<path d="M6 2h9l5 5v15H6Z"/><path d="M15 2v5h5"/>'); }
function iconPen() { return svg('<path d="m3 21 1.5-5L17 3.5a2 2 0 0 1 3 3L7.5 19 3 21Z"/>'); }
function iconCode() { return svg('<path d="m9 18-6-6 6-6"/><path d="m15 6 6 6-6 6"/>'); }
function iconBars() { return svg('<path d="M4 20V10"/><path d="M12 20V4"/><path d="M20 20v-6"/>'); }
function iconHome() { return svg('<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>'); }
function iconChat() { return svg('<path d="M4 4h16v12H8l-4 4Z"/>'); }
function iconTools() { return svg('<circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/>'); }
function iconProfile() { return svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'); }

function iconLogout() { return svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>'); }

function svg(inner) {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

async function checkSystemStatus() {
  const el = document.getElementById('system-status');
  if (!el) return;

  try {
    const data = await apiRequest('/api/health');
    el.textContent = `${data.service || 'Backend'} — ${data.status || 'unknown'}`;
    el.style.color = 'var(--status-good)';
  } catch (err) {
    el.textContent = `Backend unreachable: ${err.message}`;
    el.style.color = 'var(--status-bad)';
  }
}

function relativeTime(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

async function loadRecentActivity() {
  const el = document.getElementById('recent-activity');
  if (!el) return;

  try {
    const data = await apiRequest('/api/chat/conversations', { auth: true });
    const conversations = data.conversations || [];

    if (conversations.length === 0) {
      el.innerHTML = `<div class="empty-state">No conversations yet.</div>`;
      return;
    }

    el.className = '';
    el.innerHTML = conversations
      .slice(0, 5)
      .map(
        (c) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-subtle);">
          <span style="font-size:14px;">${escapeHtml(c.title || 'Untitled chat')}</span>
          <span style="font-size:12px; color:var(--text-muted); flex-shrink:0; margin-left:8px;">${relativeTime(c.updated_at)}</span>
        </div>
      `
      )
      .join('');
  } catch (err) {
    el.innerHTML = `<div class="empty-state">Couldn't load activity: ${escapeHtml(err.message)}</div>`;
  }
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

renderHome();
checkSystemStatus();
loadRecentActivity();

document.getElementById('logout-btn').addEventListener('click', async () => {
  await AuthService.logout();
  window.location.href = 'auth/login/login.html';
});
