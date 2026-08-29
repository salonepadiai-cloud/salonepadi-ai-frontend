// JOHNNY TEC OS — pages/profile/profile.js

if (!AuthService.isAuthenticated()) {
  window.location.href = '../../auth/login/login.html';
}

const backBtn = document.getElementById('back-btn');
backBtn.addEventListener('click', () => {
  window.location.href = '../../index.html';
});

const user = AuthService.getUser();

// ---- Real user info ----
const name = user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : 'User');
document.getElementById('profile-name').textContent = name;
document.getElementById('profile-email').textContent = user?.email || '';

if (user?.email_confirmed_at) {
  document.getElementById('verified-badge').style.display = 'inline-flex';
}

if (user?.created_at) {
  const memberSince = new Date(user.created_at).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
  document.getElementById('member-since').textContent = `Member since ${memberSince}`;
}

// ---- Avatar: real image if the person added one, honest initials fallback otherwise ----
const avatarImg = document.getElementById('avatar-img');
const avatarFallback = document.getElementById('avatar-fallback');
avatarImg.addEventListener('error', () => {
  avatarImg.style.display = 'none';
  avatarFallback.style.display = 'flex';
  avatarFallback.textContent = name.slice(0, 2).toUpperCase();
});

// ---- Real conversation count ----
async function loadConversationCount() {
  const el = document.getElementById('conversation-count');
  try {
    const conversations = await ChatService.listConversations();
    el.textContent = conversations.length;
  } catch (err) {
    if (err.status === 401) {
      AuthService.clearSession();
      window.location.href = '../../auth/login/login.html';
      return;
    }
    el.textContent = '—';
  }
}
loadConversationCount();

// ---- Conversation History: reuses the real sidebar on home ----
document.getElementById('history-row').addEventListener('click', () => {
  sessionStorage.setItem('jt_open_sidebar', '1');
  window.location.href = '../../index.html';
});

// ---- Log out: real ----
document.getElementById('logout-row').addEventListener('click', async () => {
  await AuthService.logout();
  window.location.href = '../../auth/login/login.html';
});

// ---- Not-yet-built sections: honest "coming soon", not fake or dead links ----
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

document.querySelectorAll('.settings-row[data-action]').forEach((row) => {
  row.addEventListener('click', () => showToast('Coming soon'));
});
