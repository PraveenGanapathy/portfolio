// Local preview with live reload: `node tools/preview.mjs` from the repo folder, then open http://127.0.0.1:8765/
// Rebuilds index.html when data.js or build.mjs change and reloads open tabs on every save.
// It also answers the Supabase calls with sample data, so testing never writes to the real database.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { watch } from "node:fs";
import { execFile } from "node:child_process";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(process.argv[2] || fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.argv[3] || 8765);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".mp4": "video/mp4", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".webp": "image/webp" };
const clients = new Set();
const RELOAD = `<script>new EventSource("/__reload").onmessage=()=>location.reload()</script>`;

// ---------- stand-in for Supabase, local preview only (sample data, kept in memory) ----------
const db = { visits: [], mileo_events: [], notes: [] };
{
  const regions = ["US East", "India", "US West", "UK", "US Central", "Canada East", "Singapore", "Berlin"];
  const sources = ["LinkedIn", "Direct", "GitHub", "Google", "X"];
  const now = Date.now();
  for (let i = 0; i < 260; i++) {
    const daysAgo = Math.floor(Math.pow(Math.random(), 1.6) * 30);
    db.visits.push({ created_at: new Date(now - daysAgo * 864e5 - Math.random() * 864e5).toISOString(), region: regions[Math.floor(Math.pow(Math.random(), 1.8) * regions.length)], source: sources[Math.floor(Math.pow(Math.random(), 1.7) * sources.length)], visitor: String(i % 170) });
  }
  db.mileo_events.push({ kind: "feed", food: "bone", region: "India", created_at: new Date(now - 42 * 6e4).toISOString() }, { kind: "cuddle", region: "US East", created_at: new Date(now - 9 * 6e4).toISOString() });
}
const mock = (path, body) => {
  const [, kind, name] = path.match(/^\/__mock\/rest\/v1\/(rpc\/)?(\w+)$/) ? [null, path.includes("/rpc/") ? "rpc" : "table", path.split("/").pop()] : [];
  if (kind === "table" && db[name]) {
    db[name].push({ ...body, created_at: new Date().toISOString() });
    if (name === "notes") console.log("MOCK NOTE:", body.message, body.reply_to || "");
    return [201, ""];
  }
  if (kind === "rpc" && name === "visit_stats") {
    const day = (d) => d.slice(0, 10);
    const today = new Date(); const daily = [];
    for (let i = 29; i >= 0; i--) { const d = new Date(today - i * 864e5).toISOString().slice(0, 10); daily.push({ day: d, visits: db.visits.filter((v) => day(v.created_at) === d).length }); }
    const top = (k, n) => Object.entries(db.visits.reduce((m, v) => ((m[v[k]] = (m[v[k]] || 0) + 1), m), {})).sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, visits]) => ({ name, visits }));
    return [200, JSON.stringify({ total: db.visits.length, unique: new Set(db.visits.map((v) => v.visitor)).size, daily, regions: top("region", 8), sources: top("source", 6) })];
  }
  if (kind === "rpc" && name === "mileo_state") {
    const last = (k) => { const e = db.mileo_events.filter((x) => x.kind === k).sort((a, b) => b.created_at.localeCompare(a.created_at))[0]; return e ? { food: e.food, region: e.region, at: e.created_at } : null; };
    return [200, JSON.stringify({ feeds: db.mileo_events.filter((e) => e.kind === "feed").length, cuddles: db.mileo_events.filter((e) => e.kind === "cuddle").length, last_feed: last("feed"), last_cuddle: last("cuddle") })];
  }
  return [404, "{}"];
};

createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname.startsWith("/__mock/")) {
    let raw = ""; for await (const c of req) raw += c;
    const [code, out] = mock(url.pathname, raw ? JSON.parse(raw) : {});
    res.writeHead(code, { "content-type": "application/json" }); return res.end(out);
  }
  if (url.pathname === "/__reload") {
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive" });
    res.write(": hi\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }
  let path = decodeURIComponent(url.pathname).replace(/^\/portfolio/, "") || "/";
  if (path.endsWith("/")) path += "index.html";
  const file = normalize(join(root, path));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  try {
    let body = await readFile(file);
    const type = types[extname(file)] || "application/octet-stream";
    if (type.startsWith("text/html")) body = String(body).replace("</body>", RELOAD + "</body>");
    // Videos need range support for seeking/looping in Chrome and Safari.
    const range = req.headers.range && type === "video/mp4" && req.headers.range.match(/bytes=(\d*)-(\d*)/);
    if (range) {
      const start = Number(range[1] || 0), end = range[2] ? Number(range[2]) : body.length - 1;
      res.writeHead(206, { "content-type": type, "content-range": `bytes ${start}-${end}/${body.length}`, "accept-ranges": "bytes", "content-length": end - start + 1 });
      return res.end(body.subarray(start, end + 1));
    }
    res.writeHead(200, { "content-type": type, "cache-control": "no-store", "accept-ranges": "bytes" });
    res.end(body);
  } catch {
    res.writeHead(404); res.end("not found");
  }
}).listen(port, "127.0.0.1", () => console.log(`preview on http://127.0.0.1:${port}/`));

let timer;
watch(root, { recursive: true }, (_, name) => {
  if (!name || /^(\.git|\.taste-skill|tools)|\.DS_Store/.test(name) || name === "index.html") return reload(name);
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (/^(data\.js|build\.mjs)$/.test(name)) {
      execFile("node", ["build.mjs"], { cwd: root }, (err, out, errOut) => { console.log(err ? errOut : out.trim()); });
    } else reload(name);
  }, 120);
});
function reload(name) {
  if (name && /^(\.git|\.taste-skill)|\.DS_Store/.test(name)) return;
  clearTimeout(reload.t);
  reload.t = setTimeout(() => { for (const c of clients) c.write("data: reload\n\n"); console.log("reloaded:", name); }, 150);
}
