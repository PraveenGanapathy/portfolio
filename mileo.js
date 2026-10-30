// Milo, Praveen's dog-bot: feed him, cuddle him, or give him a note to carry to Praveen.
(() => {
  const launcher = document.querySelector(".mileo-launch");
  const panel = document.getElementById("mileo");
  if (!launcher || !panel || !window.Backend) return;
  const env = window.ENV || {};
  const B = window.Backend;
  const $ = (sel) => panel.querySelector(sel);
  const dogs = document.querySelectorAll(".mileo-dog");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FOOD = { bone: "🦴", kibble: "🥣", carrot: "🥕", cookie: "🍪" };
  const FOOD_NAME = { bone: "a bone", kibble: "a bowl of kibble", carrot: "a carrot", cookie: "a cookie" };
  const LINES = {
    hello: ["Woof! I'm Milo. Praveen is busy building pipelines, so I'm on duty.", "Hi friend! Got snacks? I accept snacks.", "Woof woof! Want to leave Praveen a note? I'm a very good carrier."],
    fed: { bone: "Crunch crunch! Best bone ever. 🐾", kibble: "Nom nom nom… bowl licked clean!", carrot: "A carrot? Healthy! I'll pretend it's a treat.", cookie: "COOKIE! You're my new favourite human." },
    cuddle: ["*happy tail wagging intensifies*", "Awww. I needed that. 💙", "Belly rubs accepted. More please."],
    noted: "Got it! I'll carry this straight to Praveen. 🐾",
  };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  // ---------- open / close ----------
  let lastFocus = null, toldWeather = false;
  const open = () => {
    lastFocus = document.activeElement;
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add("is-open"));
    launcher.setAttribute("aria-expanded", "true");
    // The first hello is about the visitor's weather, when weather.js found it.
    say(window.MiloWeather && !toldWeather ? ((toldWeather = true), window.MiloWeather.line) : pick(LINES.hello));
    refresh();
    $(".mileo-close").focus();
    B.store.set("pgr-mileo-met", "1");
    launcher.classList.remove("has-bubble", "is-new");
    opened = true;
  };
  const close = () => {
    panel.classList.remove("is-open");
    launcher.setAttribute("aria-expanded", "false");
    setTimeout(() => { panel.hidden = true; }, reduce ? 0 : 280);
    if (lastFocus) lastFocus.focus();
  };
  launcher.addEventListener("click", () => (panel.hidden ? open() : close()));
  $(".mileo-close").addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) close(); });
  document.addEventListener("click", (e) => { if (!panel.hidden && !panel.contains(e.target) && !launcher.contains(e.target)) close(); });
  // Say hello once, a little after the page settles.
  // Getting attention: a "1" badge until first met, a hop now and then, and rotating speech bubbles.
  let opened = false;
  if (!B.store.get("pgr-mileo-met")) launcher.classList.add("is-new");
  const bubble = launcher.querySelector(".mileo-bubble");
  const TEASERS = ["Woof! I'm Milo 👋", "Psst… I'm hungry 🦴", "Want to leave Praveen a note?", "Cuddles? I give great cuddles 🐶", "Shy? Tell me instead, no email needed 🐾"];
  let teaser = 0, bubbleTimer;
  const pop = (text, ms = 5000) => {
    if (opened || !panel.hidden) return;
    bubble.textContent = text;
    launcher.classList.add("has-bubble");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => launcher.classList.remove("has-bubble"), ms);
  };
  setTimeout(() => pop(TEASERS[teaser++]), 9000);
  setInterval(() => { if (!document.hidden) pop(TEASERS[teaser++ % TEASERS.length]); }, 22000);
  if (!reduce) setInterval(() => {
    if (opened || document.hidden) return;
    launcher.classList.remove("is-hopping"); void launcher.offsetWidth; launcher.classList.add("is-hopping");
  }, 9000);
  launcher.addEventListener("mouseenter", () => pop("Click me! 🐶", 2500));
  const contact = document.getElementById("contact");
  if (contact && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { if (e.isIntersecting) pop("Shy? Tell me instead, no email needed 🐾", 6000); }, { threshold: 0.3 }).observe(contact);
  }
  document.querySelectorAll("[data-open-mileo]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); if (panel.hidden) open(); showTab("note"); }));
  const heard = (w) => {
    TEASERS.unshift(w.line);
    // Once per visit, tell people the sky is theirs: it follows the weather where they are.
    try { if (sessionStorage.getItem("pgr-sky-told")) return; sessionStorage.setItem("pgr-sky-told", "1"); } catch { /* no storage: tell anyway */ }
    setTimeout(() => pop(w.about, 8000), Math.max(0, 4000 - performance.now()));
  };
  // weather.js may have finished before this file ran (a cached or previewed forecast), so check first
  if (window.MiloWeather) heard(window.MiloWeather);
  else addEventListener("mileo:weather", (e) => heard(e.detail), { once: true });

  // ---------- mood and speech ----------
  let moodTimer;
  const mood = (m, ms = 2200) => {
    dogs.forEach((d) => { d.classList.remove("is-happy", "is-eating"); if (m) d.classList.add(`is-${m}`); });
    clearTimeout(moodTimer);
    if (m) moodTimer = setTimeout(() => mood(null), ms);
  };
  const say = (text) => { $(".mileo-says").textContent = text; };
  const burst = (chars, from) => {
    if (reduce) return;
    const layer = $(".mileo-burst");
    for (let i = 0; i < 7; i++) {
      const s = document.createElement("span");
      s.textContent = chars[i % chars.length];
      s.style.setProperty("--x", `${(Math.random() - 0.5) * 160}px`);
      s.style.setProperty("--r", `${(Math.random() - 0.5) * 60}deg`);
      s.style.setProperty("--d", `${i * 60}ms`);
      if (from) s.style.left = from;
      layer.appendChild(s);
      setTimeout(() => s.remove(), 1600);
    }
  };

  // ---------- state from the backend ----------
  let state = null;
  const render = () => {
    if (!state) { $(".mileo-status").textContent = B.enabled ? "Sniffing around for news…" : "Milo is here, but his memory is offline today."; return; }
    const parts = [];
    if (state.last_feed) parts.push(`Last fed ${FOOD_NAME[state.last_feed.food] || "a snack"} by a visitor from ${state.last_feed.region}, ${B.ago(state.last_feed.at)}.`);
    else parts.push("Nobody has fed me yet. Be the first!");
    if (state.last_cuddle) parts.push(`Last cuddle from ${state.last_cuddle.region}, ${B.ago(state.last_cuddle.at)}.`);
    $(".mileo-status").textContent = parts.join(" ");
    $(".mileo-feeds").textContent = new Intl.NumberFormat().format(state.feeds);
    $(".mileo-cuddles").textContent = new Intl.NumberFormat().format(state.cuddles);
  };
  const refresh = async () => {
    if (!B.enabled) return render();
    try { state = await B.rpc("mileo_state"); } catch { /* keep what we have */ }
    render();
  };

  // ---------- tabs ----------
  const tabs = panel.querySelectorAll("[role=tab]");
  const showTab = (name) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === name;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  };
  tabs.forEach((t) => {
    t.addEventListener("click", () => showTab(t.dataset.tab));
    t.addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const list = [...tabs], i = list.indexOf(t) + (e.key === "ArrowRight" ? 1 : -1);
      const next = list[(i + list.length) % list.length];
      showTab(next.dataset.tab); next.focus();
    });
  });

  // ---------- feed ----------
  panel.querySelectorAll("[data-food]").forEach((btn) => btn.addEventListener("click", async () => {
    const food = btn.dataset.food;
    mood("eating", 1800);
    burst([FOOD[food]], `${btn.offsetLeft + btn.offsetWidth / 2}px`);
    say(LINES.fed[food]);
    if (state) { state.feeds += 1; state.last_feed = { food, region: B.region, at: new Date().toISOString() }; render(); }
    try { await B.insert("mileo_events", { kind: "feed", food }); refresh(); }
    catch (e) { if (/full/i.test(e.message)) say("I'm sooo full. Maybe later? 😴"); }
    setTimeout(() => mood("happy"), 1800);
    if (typeof gtag === "function") gtag("event", "mileo_feed", { event_label: food });
  }));

  // ---------- cuddle ----------
  $(".mileo-cuddle").addEventListener("click", async () => {
    mood("happy", 2600);
    burst(["💙", "🩵", "✨"]);
    say(pick(LINES.cuddle));
    if (state) { state.cuddles += 1; state.last_cuddle = { region: B.region, at: new Date().toISOString() }; render(); }
    try { await B.insert("mileo_events", { kind: "cuddle" }); refresh(); } catch { /* still a good cuddle */ }
    if (typeof gtag === "function") gtag("event", "mileo_cuddle");
  });

  // ---------- note for Praveen ----------
  const form = $(".mileo-note");
  const status = form.querySelector(".mileo-note-status");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = form.message.value.trim();
    const replyTo = form.reply.value.trim();
    if (!message) { status.textContent = "Milo needs at least a word to carry."; form.message.focus(); return; }
    if (replyTo && !form.reply.checkValidity()) { status.textContent = "That email does not look right. Leave it empty to stay anonymous."; form.reply.focus(); return; }
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true; status.textContent = "Milo is running…";
    const tasks = [];
    if (B.enabled) tasks.push(B.insert("notes", { message, reply_to: replyTo || null }));
    // Only the real site emails Praveen; the local preview never sends real mail.
    if (B.live && window.emailjs && env.EMAILJS_NOTE_TEMPLATE_ID) {
      tasks.push(window.emailjs.send(env.EMAILJS_SERVICE_ID, env.EMAILJS_NOTE_TEMPLATE_ID, {
        message, reply_to: replyTo || "(no email left)", region: B.region, from_name: "Milo",
      }));
    }
    const results = await Promise.allSettled(tasks);
    btn.disabled = false;
    if (tasks.length && results.some((r) => r.status === "fulfilled")) {
      form.reset();
      status.textContent = "";
      say(LINES.noted);
      mood("happy", 2600);
      burst(["✉️", "🐾"]);
      if (typeof gtag === "function") gtag("event", "mileo_note");
    } else {
      const limited = results.some((r) => r.status === "rejected" && /too many/i.test(String(r.reason && r.reason.message)));
      status.innerHTML = limited
        ? "Milo has carried a lot of notes from you already. Try again in an hour."
        : `Milo tripped over his paws. Please <a href="mailto:${env.CONTACT_EMAIL || "erpraveenganapathy@gmail.com"}">email Praveen</a> instead.`;
    }
  });

  // Petting the big dog in the panel is a cuddle too.
  $(".mileo-face").addEventListener("click", () => $(".mileo-cuddle").click());
})();
