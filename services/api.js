// JOHNNY TEC OS — services/api.js
// Single place that talks HTTP to the backend. Nothing else should
// call fetch() directly against CONFIG.API_BASE_URL.

async function apiRequest(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = AuthService.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error('Could not reach the server. Check your connection.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // no JSON body — leave data as null
  }

  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }

  return data;
}
  
