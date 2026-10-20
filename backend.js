// Small client for the Supabase backend (schema in supabase/schema.sql).
// Visitors can only insert rows and call two summary functions; nothing personal is read back.
window.Backend = (() => {
  const env = window.ENV || {};
  const local = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  // The local preview always uses a stand-in API served by the preview server, so testing never
  // writes into the real database. Add ?live to a local URL to use the real one on purpose.
  const live = !local || new URLSearchParams(location.search).has("live");
  const base = live ? (env.SUPABASE_URL || "").replace(/\/$/, "") : "/__mock";
  const key = live ? env.SUPABASE_ANON_KEY || "" : "local-preview";
  const enabled = Boolean(base && key);

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };
  const visitor = (() => {
    let id = store.get("pgr-visitor");
    if (!id) { id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2); store.set("pgr-visitor", id); }
    return id;
  })();

  // Approximate region from the browser's time zone. No IP lookup, nothing precise.
  const region = (() => {
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || "").replace(/^Etc\/.*/, "");
    const named = {
      "Asia/Kolkata": "India", "Asia/Calcutta": "India", "Asia/Colombo": "Sri Lanka", "Asia/Dubai": "UAE",
      "America/New_York": "US East", "America/Detroit": "US East", "America/Toronto": "Canada East",
      "America/Chicago": "US Central", "America/Denver": "US Mountain", "America/Phoenix": "US Mountain",
      "America/Los_Angeles": "US West", "America/Vancouver": "Canada West", "Europe/London": "UK",
      "Australia/Sydney": "Australia", "Australia/Melbourne": "Australia",
    };
    if (named[tz]) return named[tz];
    const city = tz.split("/").pop();
    return city ? city.replace(/_/g, " ") : "Somewhere";
  })();

  // Sources are shown publicly, so only these names are ever sent (the database checks the same list).
  const source = (() => {
    const utm = (new URLSearchParams(location.search).get("utm_source") || "").toLowerCase();
    let host = "";
    try { host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : ""; } catch { /* bad referrer */ }
    if (!utm && (!host || host === location.hostname)) return "Direct";
    const known = [[/linkedin|lnkd\.in/, "LinkedIn"], [/github/, "GitHub"], [/google/, "Google"], [/bing/, "Bing"],
      [/duckduckgo/, "DuckDuckGo"], [/(^|\.)t\.co$|twitter|^x$|x\.com/, "X"], [/facebook/, "Facebook"], [/reddit/, "Reddit"]];
    const hit = known.find(([re]) => re.test(utm || host));
    return hit ? hit[1] : "Other";
  })();

  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  const insert = async (table, row) => {
    if (!enabled) throw new Error("backend not configured");
    const res = await fetch(`${base}/rest/v1/${table}`, { method: "POST", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify({ ...row, visitor, region }) });
    if (!res.ok) throw new Error((await res.text()) || res.statusText);
  };
  const rpc = async (fn) => {
    if (!enabled) throw new Error("backend not configured");
    const res = await fetch(`${base}/rest/v1/rpc/${fn}`, { method: "POST", headers, body: "{}" });
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  };

  // Count one visit per browser session.
  const visitLogged = (() => {
    if (!enabled) return Promise.resolve();
    try { if (sessionStorage.getItem("pgr-visit")) return Promise.resolve(); sessionStorage.setItem("pgr-visit", "1"); } catch { /* ignore */ }
    return insert("visits", { source }).catch(() => {});
  })();

  const ago = (iso) => {
    const s = Math.max(0, (Date.now() - new Date(iso)) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.round(s / 60)} min ago`;
    if (s < 86400) return `${Math.round(s / 3600)} h ago`;
    return `${Math.round(s / 86400)} d ago`;
  };

  return { enabled, live, region, source, visitor, insert, rpc, visitLogged, ago, store };
})();
