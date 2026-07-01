// client/src/services/tokenStore.js
// Holds the access token in MEMORY only (not localStorage) — safe from XSS.
// Trade-off: memory is wiped on browser refresh, so AuthContext silently
// re-fetches a new token from the httpOnly refresh cookie on app load.

let accessToken = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (token) => { accessToken = token; };
export const clearAccessToken = () => { accessToken = null; };