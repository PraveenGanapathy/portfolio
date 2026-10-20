// Mileo dresses for the visitor's weather: rough location from their IP (GeoJS), current conditions from
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
  const ICON = { clear: "☀️", cloudy: "☁️", fog: "🌫️", rain: "☔", storm: "⛈️", snow: "❄️" };
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
    const wx = await getJSON(`https://api.open-meteo.com/v1/forecast?latitude=${Number(geo.latitude)}&longitude=${Number(geo.longitude)}&current=temperature_2m,weather_code,is_day`);
    const result = { at: Date.now(), city: geo.city || "", region: geo.region || geo.country || "", country: geo.country_code || "", code: wx.current.weather_code, temp: wx.current.temperature_2m, day: wx.current.is_day === 1 };
    try { sessionStorage.setItem("pgr-weather", JSON.stringify(result)); } catch { /* no storage */ }
    return result;
  };

  const apply = (w) => {
    w.kind = KINDS.includes(w.kind) ? w.kind : kindOf(w.code);
    w.cold = w.temp != null && w.temp < 5;
    w.line = line(w);
    root.dataset.wx = w.kind;
    root.toggleAttribute("data-wx-day", w.day);
    root.toggleAttribute("data-wx-cold", w.cold);
    // Weather details go on the small Mileo: under his name on the button, and at the top of his panel.
    const f = w.country === "US";
    const temp = w.temp == null ? "" : ` · ${Math.round(f ? w.temp * 1.8 + 32 : w.temp)}°${f ? "F" : "C"}`;
    const place = [w.city, w.region].filter(Boolean).join(", ");
    const icon = w.kind === "clear" && !w.day ? "🌙" : ICON[w.kind];
    const label = document.querySelector(".mileo-label span");
    if (label) label.textContent = `${icon} ${LABEL[w.kind]}${temp}${w.city ? ` · ${w.city}` : ""}`;
    const panel = document.querySelector(".mileo-wx");
    if (panel) {
      const head = document.createElement("b");
      head.textContent = `${icon} ${LABEL[w.kind]}${temp}`;
      panel.replaceChildren(head, place ? ` in ${place}, my guess from your connection.` : "");
      panel.hidden = false;
    }
    window.MileoWeather = w;
    dispatchEvent(new CustomEvent("mileo:weather", { detail: w }));
    sky(w);
  };

  // Rain, snow or a storm falling across the hero, drawn on one canvas while the hero is on screen.
  const sky = (w) => {
    const canvas = document.querySelector(".hero .weather");
    if (!canvas || reduce || !["rain", "storm", "snow"].includes(w.kind)) return;
    const ctx = canvas.getContext("2d");
    const snow = w.kind === "snow";
    let width = 0, height = 0, drops = [], raf = 0, flash = 0;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      width = canvas.clientWidth; height = canvas.clientHeight;
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((width * height) / (snow ? 9000 : 5000));
      drops = Array.from({ length: n }, () => ({ x: Math.random() * width, y: Math.random() * height, z: 0.4 + Math.random() * 0.8, p: Math.random() * 6.28 }));
    };
    const frame = () => {
      raf = requestAnimationFrame(frame);
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
        if (snow) {
          d.y += d.z * 0.9; d.p += 0.02; d.x += Math.sin(d.p) * 0.5;
          ctx.moveTo(d.x + d.z * 2.2, d.y); ctx.arc(d.x, d.y, d.z * 2.2, 0, 6.28);
        } else {
          d.y += d.z * 14; d.x -= d.z * 2;
          ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.z * 3, d.y - d.z * 18);
        }
        if (d.y > height + 20) { d.y = -20; d.x = Math.random() * (width + 100); }
      }
      snow ? ctx.fill() : ctx.stroke();
    };
    size();
    addEventListener("resize", size);
    new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); if (e.isIntersecting) raf = requestAnimationFrame(frame); }).observe(canvas);
  };

  // Until the real weather arrives (or if it never does), day or night follows the visitor's clock.
  const hour = new Date().getHours();
  root.toggleAttribute("data-wx-day", hour >= 6 && hour < 18);

  const forced = params.get("weather");
  if (forced) apply({ kind: forced, city: "", temp: forced === "snow" ? -2 : null, day: !params.has("night") });
  else lookup().then(apply).catch(() => { /* offline or blocked: Mileo stays in his usual coat */ });
})();
