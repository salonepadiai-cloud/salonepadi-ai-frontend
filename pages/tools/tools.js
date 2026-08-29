// JOHNNY TEC OS — pages/tools/tools.js

if (!AuthService.isAuthenticated()) {
  window.location.href = '../../auth/login/login.html';
}

document.getElementById('back-btn').addEventListener('click', () => {
  window.location.href = '../../index.html';
});

document.getElementById('whatsapp-tile').addEventListener('click', () => {
  window.location.href = 'whatsapp/whatsapp.html';
});

async function checkWhatsappStatus() {
  const el = document.getElementById('whatsapp-status');
  try {
    const data = await apiRequest('/api/whatsapp/status', { auth: true });
    if (data.connected) {
      el.className = 'tool-tile-status tool-tile-status--online';
      el.innerHTML = `<span class="tool-tile-status-dot"></span><span>Active</span>`;
    } else {
      el.className = 'tool-tile-status tool-tile-status--offline';
      el.innerHTML = `<span class="tool-tile-status-dot"></span><span>Offline</span>`;
    }
  } catch (_) {
    // No /api/whatsapp/status route exists on the backend yet — that's
    // expected right now, so we show Offline rather than guessing.
    el.className = 'tool-tile-status tool-tile-status--offline';
    el.innerHTML = `<span class="tool-tile-status-dot"></span><span>Offline</span>`;
  }
}
checkWhatsappStatus();
