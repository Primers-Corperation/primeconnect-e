// "Continue with Primers ID" in the browser: PKCE (S256) + state, kept in sessionStorage for one
// round trip. Primers ID returns a one-time code to /auth/primers; our server swaps it (with the
// verifier) for the person's verified name and email.

export const PRIMERS_ID_URL = 'https://id.primersgroup.ng';
const KEY = 'primers-id-connect';

const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const random = (n) => b64url(crypto.getRandomValues(new Uint8Array(n)));

// mode 'signup' opens Primers ID on "Create account" (OpenID prompt=create).
export async function startPrimersSignIn(clientId, returnTo = '/dashboard', mode = 'signin') {
  const signup = mode === 'signup';
  const verifier = random(32);
  const state = random(16);
  const challenge = b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
  localStorage.setItem(KEY, JSON.stringify({ verifier, state, returnTo, mode, at: Date.now() }));
  const u = new URL('/connect', PRIMERS_ID_URL);
  u.search = new URLSearchParams({
    client_id: clientId, redirect_uri: `${window.location.origin}/auth/primers`,
    code_challenge: challenge, code_challenge_method: 'S256', state,
    ...(signup ? { prompt: 'create' } : {}),
  }).toString();
  window.location.assign(u.href);
}

/** Reads and clears the round trip. Throws a readable message if anything doesn't match. */
export function finishPrimersSignIn() {
  const params = new URLSearchParams(window.location.search);
  window.history.replaceState(null, '', window.location.pathname); // keep the code out of history
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { /* ignore */ }
  localStorage.removeItem(KEY);
  if (params.get('error')) throw new Error('Sign-in was cancelled.');
  const code = params.get('code');
  if (!saved || !code || params.get('state') !== saved.state || Date.now() - saved.at > 30 * 60_000) {
    throw new Error('That sign-in link expired. Please try again.');
  }
  const returnTo = /^\/(?!\/)/.test(saved.returnTo || '') ? saved.returnTo : '/dashboard';
  return { code, verifier: saved.verifier, returnTo, mode: saved.mode === 'link' ? 'link' : 'signin' };
}

// A pending "connect your Primers ID" after a password sign-in (15-minute ticket from our server).
const TICKET = 'primers-id-link-ticket';
export function savePendingLink(ticket, email) {
  try { sessionStorage.setItem(TICKET, JSON.stringify({ ticket, email, at: Date.now() })); } catch { /* storage off */ }
}
export function readPendingLink() {
  try {
    const v = JSON.parse(sessionStorage.getItem(TICKET) || 'null');
    if (v && v.ticket && Date.now() - v.at < 14 * 60_000) return v;
  } catch { /* ignore */ }
  clearPendingLink();
  return null;
}
export function clearPendingLink() {
  try { sessionStorage.removeItem(TICKET); } catch { /* ignore */ }
}
