// Milo dresses for the visitor's weather: rough location from their IP (GeoJS), current conditions from
// Open-Meteo. Neither needs a key and nothing is stored beyond a 30-minute cache in this browser tab.
// Preview an outfit with ?weather=rain (or snow, storm, clear, cloudy, fog; add &night for night-time).
(() => {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const KINDS = ["clear", "cloudy", "fog", "rain", "storm", "snow"];

  // WMO weather codes, as Open-Meteo reports them.
  const kindOf = (code) =>
    code <= 1 ? "clear" : code <= 3 ? "cloudy" : code <= 48 ? "fog" : code <= 67 ? "rain"
      : code <= 77 ? "snow" : code <= 82 ? "rain" : code <= 86 ? "snow" : "storm";
  const LABEL = { clear: "Clear", cloudy: "Cloudy", fog: "Foggy", rain: "Rain", storm: "Thunderstorm", snow: "Snow" };
  const line = ({ kind, city, day, cold }) => {
    const where = city ? ` in ${city}` : " where you are";
    const text = {
      rain: `It's raining${where}, so I brought my umbrella ☔`,
      storm: `Thunder${where}! I'm hiding under my umbrella ⛈️`,
      snow: `It's snowing${where}! Jacket and beanie on ❄️`,
      clear: day ? `Sunny${where}. Shades on 😎` : `Clear skies${where} tonight ✨`,
      cloudy: `Cloudy${where}. Perfect walk weather ☁️`,
      fog: `Foggy${where}. Don't worry, I'll sniff the way 🌫️`,
    }[kind];
    return cold && kind !== "snow" ? `${text} It's chilly, so I zipped up my jacket.` : text;
  };

  const getJSON = (url) => fetch(url, { signal: AbortSignal.timeout(6000) }).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });
  const lookup = async () => {
    try {
      const cached = JSON.parse(sessionStorage.getItem("pgr-weather") || "null");
      if (cached && Date.now() - cached.at < 30 * 60e3) return cached;
    } catch { /* no storage */ }
    const geo = await getJSON("https://get.geojs.io/v1/ip/geo.json");
    const wx = await getJSON(`https://api.open-meteo.com/v1/forecast?latitude=${Number(geo.latitude)}&longitude=${Number(geo.longitude)}&current=temperature_2m,weather_code,is_day&daily=sunrise,sunset&forecast_days=1&timezone=auto&timeformat=unixtime`);
    const result = { at: Date.now(), city: geo.city || "", region: geo.region || geo.country || "", country: geo.country_code || "", code: wx.current.weather_code, temp: wx.current.temperature_2m, day: wx.current.is_day === 1, sunrise: wx.daily.sunrise[0], sunset: wx.daily.sunset[0] };
    try { sessionStorage.setItem("pgr-weather", JSON.stringify(result)); } catch { /* no storage */ }
    return result;
  };

  const apply = (w) => {
    w.kind = KINDS.includes(w.kind) ? w.kind : kindOf(w.code);
    w.cold = w.temp != null && w.temp < 5;
    w.line = line(w);
    w.about = `This page's sky follows your weather${w.city ? ` in ${w.city}` : ""}: ${LABEL[w.kind].toLowerCase()} ${w.day ? "today" : "tonight"}.`;
    root.dataset.wx = w.kind;
    root.toggleAttribute("data-wx-day", w.day);
    root.toggleAttribute("data-wx-cold", w.cold);
    // Weather details go on the small Milo: under his name on the button, and at the top of his panel.
    const f = w.country === "US";
    const temp = w.temp == null ? "" : `, ${Math.round(f ? w.temp * 1.8 + 32 : w.temp)}°${f ? "F" : "C"}`;
    const place = [w.city, w.region].filter(Boolean).join(", ");
    const label = document.querySelector(".mileo-label span");
    if (label) label.textContent = `${LABEL[w.kind]}${temp}${w.city ? `, ${w.city}` : ""}`;
    const panel = document.querySelector(".mileo-wx");
    if (panel) {
      const head = document.createElement("b");
      head.textContent = `${LABEL[w.kind]}${temp}`;
      panel.replaceChildren(head, place ? ` in ${place}, my guess from your connection. The sky on this page follows it.` : " The sky on this page follows your weather.");
      panel.hidden = false;
    }
    window.MiloWeather = w;
    dispatchEvent(new CustomEvent("mileo:weather", { detail: w }));
    sky(w);
    arc(w);
  };

  // Rain, snow or a storm falling down the whole page, drawn on one canvas fixed behind it.
  // On the first screen the drops meet the giant name along each letter's real outline: rain splashes off it;
  // snow settles, slides where a slope is steeper than snow can hold, and spills off the edges to land lower down.
  const sky = (w) => {
    const canvas = document.querySelector(".sky .weather");
    if (!canvas || reduce || !["rain", "storm", "snow"].includes(w.kind)) return;
    const ctx = canvas.getContext("2d");
    const snow = w.kind === "snow";
    // snow is kept in 3px columns per letter, at most 22px deep; a column more than 1.6px above its neighbour slides,
    // and an outline falling more than 2.5px from one column to the next (about 40 degrees) is too steep to hold any snow
    const BIN = 3, DEEP = 22, REPOSE = 1.6, STEEP = 2.5;
    let width = 0, height = 0, drops = [], flash = 0, letters = [], loose = [], splashes = [], tick = 0;

    // A letter's top edge, column by column: draw it off screen and find the first inked pixel in each column.
    // Offsets are from the letter's box, so they hold while the page scrolls. Kept until the font or size changes.
    const pad = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    let outlines = new WeakMap();
    const outline = (ch, r) => {
      const cs = getComputedStyle(ch), known = outlines.get(ch);
      if (known && known.size === cs.fontSize) return known.top;
      const probe = document.createElement("span"); // a 0-size inline block sits on the baseline
      probe.style.cssText = "display:inline-block;width:0;height:0";
      ch.append(probe);
      const base = probe.getBoundingClientRect().top - r.top;
      probe.remove();
      const fs = parseFloat(cs.fontSize), wide = Math.max(1, Math.ceil(r.width)), tall = Math.ceil(fs * 1.3);
      pad.canvas.width = wide; pad.canvas.height = tall;
      pad.font = `${cs.fontSize} ${cs.fontFamily}`;
      pad.fillText(ch.textContent.toUpperCase(), 0, fs); // the page shows the name in capitals
      const ink = pad.getImageData(0, 0, wide, tall).data;
      const top = Array.from({ length: Math.max(1, Math.floor(wide / BIN)) }, (_, i) => {
        const x = Math.min(wide - 1, i * BIN + 1);
        for (let y = 0; y < tall; y++) if (ink[(y * wide + x) * 4 + 3] > 128) return base - (fs - y);
        return null; // no ink in this column: snow falls straight past
      });
      // a column on a steep side (the curve of a P, the slope of an A or V) holds nothing: snow slides past it
      const ledge = top.map((y, i) => y != null && [top[i - 1], top[i + 1]].every((n) => n == null || Math.abs(n - y) <= STEEP) ? y : null);
      top.splice(0, top.length, ...ledge);
      outlines.set(ch, { size: cs.fontSize, top });
      return top;
    };
    // Letters in page coordinates, so the snow on them moves with the page as it scrolls.
    const measure = () => {
      const sy = scrollY;
      letters = [...document.querySelectorAll(".hero-name .ch")].map((ch, i) => {
        const r = ch.getBoundingClientRect(), top = outline(ch, r), old = letters[i];
        const same = old && old.pile.length === top.length;
        return { l: r.left, y: r.top + sy, top, pile: same ? old.pile : top.map(() => 0), over: same ? old.over : {} };
      });
    };
    // Where something at x, falling on screen from y0 to y1, meets a letter or the snow already on it.
    const land = (x, y0, y1, sy) => {
      for (const L of letters) {
        const i = Math.floor((x - L.l) / BIN);
        if (i < 0 || i >= L.top.length || L.top[i] == null) continue;
        const s = L.y + L.top[i] - sy - L.pile[i];
        if (y0 < s && y1 >= s) return [L, i, s];
      }
      return null;
    };
    // a flake is wider than one column: it settles across its neighbours too
    const settle = ([L, i], amount) => {
      for (const [j, share] of [[i - 1, 0.25], [i, 0.5], [i + 1, 0.25]]) {
        if (L.top[j] != null) L.pile[j] = Math.min(DEEP, L.pile[j] + amount * share);
      }
    };
    // Snow flows: from each column to a lower neighbour while the step is steeper than it can hold,
    // and over an edge (or into a gap in the letter) as loose snow that falls and lands again.
    const flow = (L, sy) => {
      const p = L.pile, t = L.top, n = p.length;
      for (let i = 0; i < n; i++) {
        if (t[i] == null || p[i] <= 0.05) continue;
        for (const j of [i - 1, i + 1]) {
          if (j < 0 || j >= n || t[j] == null) {
            if (p[i] > REPOSE) { // snow leaning over the edge gathers there and drops off in clumps, not a trickle
              const m = (p[i] - REPOSE) * 0.3, k = `${i}${j < i ? "<" : ">"}`;
              p[i] -= m;
              L.over[k] = (L.over[k] || 0) + m;
              if (L.over[k] > 1.5 && loose.length < 200) {
                const side = j < i ? -1 : 1;
                loose.push({ x: L.l + (side < 0 ? i * BIN - 2 : (i + 1) * BIN + 2), y: L.y + t[i] - sy - p[i], vx: side * (0.6 + Math.random() * 0.8), vy: -0.3, m: L.over[k], r: 1.6 + Math.random() });
                L.over[k] = 0;
              }
            }
          } else {
            const step = (t[j] - p[j]) - (t[i] - p[i]); // how far the neighbour's snow surface sits below this one
            if (step > REPOSE) { const m = Math.min(p[i], (step - REPOSE) * 0.25); p[i] -= m; p[j] += m; }
          }
        }
      }
    };

    const size = () => {
      // a phone's address bar showing or hiding changes only the height; keep the drops falling
      if (drops.length && canvas.clientWidth === width) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      width = canvas.clientWidth; height = canvas.clientHeight;
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      outlines = new WeakMap(); // the font size may have changed with the window
      const n = Math.round((width * height) / (snow ? 9000 : 5000));
      drops = Array.from({ length: n }, () => ({ x: Math.random() * width, y: Math.random() * height, z: 0.4 + Math.random() * 0.8, p: Math.random() * 6.28 }));
    };
    const frame = () => {
      const sy = scrollY;
      if (tick++ % 30 === 0) measure(); // the letters rise in at first; after that this only catches layout changes
      ctx.clearRect(0, 0, width, height);
      if (w.kind === "storm") {
        if (flash <= 0 && Math.random() < 0.004) flash = 1;
        if (flash > 0) { ctx.fillStyle = `rgba(207, 230, 255, ${flash * 0.18})`; ctx.fillRect(0, 0, width, height); flash -= 0.06; }
      }
      ctx.strokeStyle = "rgba(160, 205, 255, 0.45)";
      ctx.fillStyle = "rgba(238, 244, 255, 0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const d of drops) {
        const y0 = d.y;
        if (snow) {
          d.y += d.z * 0.9; d.p += 0.02; d.x += Math.sin(d.p) * 0.5;
          const hit = land(d.x, y0, d.y, sy);
          if (hit) { settle(hit, d.z * 1.4); d.y = -20; d.x = Math.random() * width; continue; }
          ctx.moveTo(d.x + d.z * 2.2, d.y); ctx.arc(d.x, d.y, d.z * 2.2, 0, 6.28);
        } else {
          d.y += d.z * 14; d.x -= d.z * 2;
          const hit = land(d.x, y0, d.y, sy);
          if (hit) { // the drop breaks into a few droplets that jump up and fall back
            for (let k = 0; k < 3; k++) splashes.push({ x: d.x, y: hit[2], vx: (Math.random() - 0.5) * 3, vy: -1 - Math.random() * 2.2, life: 1 });
            d.y = -20; d.x = Math.random() * (width + 100);
            continue;
          }
          ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.z * 3, d.y - d.z * 18);
        }
        if (d.y > height + 20) { d.y = -20; d.x = Math.random() * (width + 100); }
      }
      if (snow) { // loose snow sliding off the letters: it falls, and lands again if there is a letter below
        loose = loose.filter((s) => {
          const y0 = s.y;
          s.vy = Math.min(2.5, s.vy + 0.12); s.x += s.vx; s.y += s.vy;
          const hit = land(s.x, y0, s.y, sy);
          if (hit) { settle(hit, s.m); return false; }
          ctx.moveTo(s.x + s.r, s.y); ctx.arc(s.x, s.y, s.r, 0, 6.28);
          return s.y < height + 10;
        });
      }
      snow ? ctx.fill() : ctx.stroke();
      if (splashes.length) {
        ctx.beginPath();
        for (const s of splashes) { s.vy += 0.25; s.x += s.vx; s.y += s.vy; s.life -= 0.05; ctx.moveTo(s.x + 1.2, s.y); ctx.arc(s.x, s.y, 1.2, 0, 6.28); }
        ctx.fillStyle = "rgba(160, 205, 255, 0.7)";
        ctx.fill();
        splashes = splashes.filter((s) => s.life > 0);
      }
      if (snow) { // the snow on each letter, following its outline: up along the snow, back along the letter
        ctx.fillStyle = "rgba(238, 244, 255, 0.95)";
        ctx.beginPath();
        for (const L of letters) {
          const base = L.y - sy;
          if (base > height + 40 || base + 400 < 0) continue;
          flow(L, sy);
          let run = [];
          const close = () => {
            if (run.length > 1) {
              ctx.moveTo(L.l + run[0] * BIN, base + L.top[run[0]]);
              for (const i of run) ctx.lineTo(L.l + i * BIN + BIN / 2, base + L.top[i] - L.pile[i]);
              ctx.lineTo(L.l + (run[run.length - 1] + 1) * BIN, base + L.top[run[run.length - 1]]);
              for (let k = run.length - 1; k >= 0; k--) ctx.lineTo(L.l + run[k] * BIN + BIN / 2, base + L.top[run[k]]);
              ctx.closePath();
            }
            run = [];
          };
          L.pile.forEach((h, i) => (h > 0.3 && L.top[i] != null ? run.push(i) : close()));
          close();
        }
        ctx.fill();
      }
    };
    size();
    addEventListener("resize", size);
    // outlines read before the display font arrived came from the fallback face; read them again
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { outlines = new WeakMap(); measure(); });
    // With smooth scrolling, Lenis calls this right after it moves the page (see index.html); otherwise it runs itself.
    window.skyFrame = frame;
    const loop = () => { if (!window.lenis) frame(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  };

  // The sun crosses the hero from sunrise to sunset, the moon from sunset to sunrise: left to right,
  // low at the edges and highest halfway. Without real times (or before they load) the day is 6:00 to 18:00.
  // Preview a time with ?hour=9 (any 0 to 23).
  const clock = () => { const d = new Date(); if (params.has("hour")) d.setHours(Number(params.get("hour")), 0, 0, 0); return d; };
  const arc = (w) => {
    const d = clock(), now = d / 1000;
    const rise = w.sunrise || new Date(d).setHours(6, 0, 0, 0) / 1000;
    const set = w.sunset || new Date(d).setHours(18, 0, 0, 0) / 1000;
    const [from, to] = now >= rise && now < set ? [rise, set] : now >= set ? [set, rise + 86400] : [set - 86400, rise];
    const f = Math.min(1, Math.max(0, (now - from) / (to - from)));
    root.style.setProperty("--sky-x", `${10 + 80 * f}%`);
    root.style.setProperty("--sky-y", `${17 - 11 * Math.sin(Math.PI * f)}rem`);
    // The name's shadow points away from the light, toward the middle of its lower half, and grows as the light sinks.
    const rem = parseFloat(getComputedStyle(root).fontSize);
    const dx = innerWidth * (0.4 - 0.8 * f), dy = innerHeight * 0.7 - (17 - 11 * Math.sin(Math.PI * f)) * rem;
    const reach = (0.6 + 0.8 * (1 - Math.sin(Math.PI * f))) * 0.006 / (Math.hypot(dx, dy) || 1);
    root.style.setProperty("--sx", `${dx * reach}em`);
    root.style.setProperty("--sy", `${dy * reach}em`);
  };
  setInterval(() => arc(window.MiloWeather || {}), 5 * 60e3);
  // The name rises in through a mask; once it has (about 2.6s after the page shows), drop the mask so the shadow can show.
  const settle = () => (root.classList.contains("is-revealed") ? setTimeout(() => root.classList.add("name-settled"), 2600) : setTimeout(settle, 250));
  settle();

  // Until the real weather arrives (or if it never does), day or night follows the visitor's clock.
  const hour = clock().getHours();
  root.toggleAttribute("data-wx-day", hour >= 6 && hour < 18);
  arc({});

  const forced = params.get("weather");
  if (forced) apply({ kind: forced, city: "", temp: forced === "snow" ? -2 : null, day: params.has("hour") ? hour >= 6 && hour < 18 : !params.has("night") });
  else lookup().then(apply).catch(() => { /* offline or blocked: Milo stays in his usual coat */ });
})();
