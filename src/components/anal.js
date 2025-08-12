// analytics.js
// Backend base URL (yours)
const BASE_URL = "https://benifit-gpt-be.onrender.com";

// Keep a lightweight session id to correlate events
function getOrCreateSessionId() {
  const KEY = "session_id";
  let sid = localStorage.getItem(KEY);
  if (!sid) {
    sid =
      (crypto && crypto.randomUUID && crypto.randomUUID()) ||
      String(Date.now()) + Math.random().toString(16).slice(2);
    localStorage.setItem(KEY, sid);
  }
  return sid;
}

async function post(path, payload = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "omit",
    });
    if (!res.ok) {
      console.warn(`Analytics POST ${path} failed:`, res.status);
      return null;
    }
    return await res.json().catch(() => ({}));
  } catch (e) {
    console.warn("Analytics POST error:", e);
    return null;
  }
}

/** Log a generic analytics event */
export function logEvent({ type, page = null, buttonId = null, userId = null, meta = {} }) {
  return post("/analytics/event", {
    type,
    page,
    buttonId,
    userId,
    sessionId: getOrCreateSessionId(),
    meta,
  });
}

/** 1) Homepage view */
export function logPageView({ page = "/", userId = null, meta = {} } = {}) {
  return post("/analytics/pageview", {
    page,
    userId,
    sessionId: getOrCreateSessionId(),
    meta,
  });
}

/** 2) Button click */
export function logButtonClick({ page = "/", buttonId, userId = null, meta = {} }) {
  if (!buttonId) {
    console.warn("logButtonClick requires buttonId");
    return Promise.resolve(null);
  }
  return post("/analytics/button", {
    page,
    buttonId,
    userId,
    sessionId: getOrCreateSessionId(),
    meta,
  });
}

/** 3) Congratulations page visit */
export function logCongratsVisit({ userId = null, meta = {} } = {}) {
  return post("/analytics/congrats", {
    userId,
    sessionId: getOrCreateSessionId(),
    meta,
  });
}

/** 4) Fetch homepage view count from summary */
export async function fetchHomepageViewCount() {
  try {
    const res = await fetch(`${BASE_URL}/analytics/summary`);
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const data = await res.json();
    const pages = data?.pages || [];
    const homepage = pages.find(
      (p) => p._id?.type === "page_view" && (p._id?.page === "/" || !p._id?.page)
    );
    return homepage?.count || 0;
  } catch (err) {
    console.warn("fetchHomepageViewCount error:", err);
    return 0;
  }
}
