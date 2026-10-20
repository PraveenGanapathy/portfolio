// Portfolio behaviour: preloader, reveals, nav, the mirror hall of projects, liquid images, résumé form.
// The page is complete without this file; every part here only adds to it.

const RESUME_LINK = (window.ENV && window.ENV.RESUME_LINK) || "https://praveenganapathy.github.io/online-resume/PraveenGanapathyRavi_Resume.pdf";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 769px)").matches;
const root = document.documentElement;
const track = (name, params) => { if (typeof window.gtag === "function") window.gtag("event", name, params); };

// Above 1920px the rem layout keeps growing, damped; below it the CSS media queries drive the root size.
(() => {
  const apply = () => {
    const w = innerWidth;
    const size = 16 - (16 * (((1920 - w) / 1920) * 100 * 0.6666)) / 100;
    if (size > 16) root.style.fontSize = `${size}px`; else root.style.removeProperty("font-size");
  };
  apply();
  addEventListener("resize", apply);
})();

// Preloader: count to 100 over 2s, fade the labels, wipe the curtain up, then let the hero play.
(() => {
  const pre = document.getElementById("preloader");
  const done = () => {
    root.classList.remove("is-loading");
    root.classList.add("is-revealed");
    if (window.lenis) window.lenis.start();
    // The counter starts at the top; a link to a section (…/#projects) should still land there.
    let target = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
    if (target && target.closest(".hall-info")) target = document.getElementById("projects"); // the hall shows that project
    if (target) window.lenis ? window.lenis.scrollTo(target, { immediate: true }) : target.scrollIntoView();
  };
  if (!pre || !root.classList.contains("is-loading")) { done(); return; }
  scrollTo(0, 0);
  const num = pre.querySelector(".pre-count span");
  const t0 = performance.now();
  const count = (now) => {
    const p = Math.min(1, (now - t0) / 2000);
    num.textContent = Math.round(p * 100);
    if (p < 1) { requestAnimationFrame(count); return; }
    pre.classList.add("is-fading");
    setTimeout(() => {
      root.classList.add("is-revealed");
      pre.classList.add("is-wiping");
      root.classList.remove("is-loading");
      setTimeout(() => { done(); pre.remove(); }, 700);
    }, 500);
  };
  requestAnimationFrame(count);
})();

// Header: hide the name after scrolling, mark the section in view, smooth anchor jumps, phone menu.
(() => {
  let on = false;
  const update = () => { const s = scrollY > 40; if (s !== on) { on = s; root.classList.toggle("is-scrolled", s); } };
  addEventListener("scroll", update, { passive: true });
  update();

  const links = [...document.querySelectorAll(".nav-links a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) links.forEach((a, i) => a.classList.toggle("is-current", sections[i] === e.target));
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => s && io.observe(s));

  const burger = document.querySelector(".burger");
  const menu = document.getElementById("menu");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add("is-open")); window.lenis && window.lenis.stop(); }
    else { menu.classList.remove("is-open"); setTimeout(() => { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 450); window.lenis && window.lenis.start(); }
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute("data-open-mileo")) return;
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    if (!menu.hidden) setMenu(false);
    if (window.lenis) { e.preventDefault(); window.lenis.scrollTo(target); history.replaceState(null, "", a.getAttribute("href")); }
  });
})();

// Section headings split into lines that slide up; blocks marked data-rise fade up. Both play once.
(() => {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); }
  }, { threshold: 0 });
  const split = (el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="w">${w.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c])}</span>`).join(" ");
    const lines = [];
    let top = null;
    el.querySelectorAll(".w").forEach((w) => {
      if (w.offsetTop !== top) { lines.push([]); top = w.offsetTop; }
      lines[lines.length - 1].push(w.textContent);
    });
    el.innerHTML = lines.map((l, i) => `<span class="split-line" style="--n:${i}"><span>${l.join(" ")}</span></span>`).join("");
    el.classList.add("is-split");
  };
  document.querySelectorAll("[data-rise]").forEach((el) => io.observe(el));
  const headings = document.querySelectorAll("[data-split]");
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    headings.forEach((el) => { if (!reduceMotion) split(el); io.observe(el); });
  });
})();

// The mirror hall: projects stand on a curved, endless arc around the viewer, over a rippling reflection.
// Drag to spin it (with inertia), or use the arrows, dots and arrow keys. The card in front plays its video.
(() => {
  const stage = document.querySelector(".hall-stage");
  if (!stage) return;
  const views = [...stage.querySelectorAll(".hall-view")];
  const ring = views[0].querySelector(".hall-ring");
  const mirrorRing = views[1].querySelector(".hall-ring");
  const projects = [...ring.children];
  const N = projects.length;
  // Enough copies of the set to fill the arc; the copies are decoration, the originals carry the content.
  while (ring.children.length < 14) projects.forEach((c) => { const copy = c.cloneNode(true); copy.setAttribute("aria-hidden", "true"); ring.append(copy); });
  const cards = [...ring.children];
  const M = cards.length;
  cards.forEach((c) => {
    const li = document.createElement("li");
    li.className = "hall-card";
    const img = new Image();
    img.src = c.querySelector("video").poster;
    img.alt = "";
    img.loading = "lazy";
    li.append(img);
    mirrorRing.append(li);
  });
  const mirrors = [...mirrorRing.children];
  const infos = [...document.querySelectorAll(".hall-info")];
  const dots = [...document.querySelectorAll(".dots button")];
  const count = document.querySelector(".hall-count span");
  const water = document.querySelector("#water feTurbulence");
  const waterMap = document.querySelector("#water feDisplacementMap");
  const STEP = 0.27; // radians between neighbouring cards
  let gap = 1, radius = 0, pos = 0, vel = 0, target = null, current = -1, front = -1, tracked = 0, inView = false, raf = 0, still = false;

  const layout = () => {
    gap = cards[0].offsetWidth * 1.08;
    radius = gap / STEP;
    views.forEach((v) => { v.style.perspective = `${Math.round(radius * 1.5)}px`; });
    render();
  };
  const setFront = (j) => {
    front = j;
    cards.forEach((c, k) => {
      c.classList.toggle("is-front", k === j);
      const v = c.querySelector("video");
      if (k === j && inView && !reduceMotion) { v.preload = "auto"; v.play().catch(() => {}); } else if (!v.paused) v.pause();
    });
    const i = j % N;
    if (i === current) return;
    current = i;
    infos.forEach((el, k) => { el.hidden = k !== i; });
    dots.forEach((d, k) => d.setAttribute("aria-selected", String(k === i)));
    count.textContent = String(i + 1).padStart(2, "0");
  };
  const render = () => {
    cards.forEach((c, j) => {
      const o = ((((j - pos) % M) + M + M / 2) % M) - M / 2; // offset from the front, wrapped
      const a = o * STEP;
      const t = `translate3d(${(radius * Math.sin(a)).toFixed(1)}px, 0, ${(radius * (1 - Math.cos(a))).toFixed(1)}px) rotateY(${(-a).toFixed(4)}rad)`;
      const fade = Math.max(0, Math.min(1, (M / 2 - 0.6 - Math.abs(o)) / 1.2));
      const lit = (0.45 + 0.55 * Math.max(0, 1 - Math.abs(o) / 3)) * fade;
      c.style.transform = mirrors[j].style.transform = t;
      c.style.opacity = mirrors[j].style.opacity = fade.toFixed(3);
      c.style.zIndex = mirrors[j].style.zIndex = String(100 - Math.round(Math.abs(o) * 10));
      c.style.setProperty("--lit", lit.toFixed(3));
      mirrors[j].style.setProperty("--lit", lit.toFixed(3));
      c.style.setProperty("--glow", Math.max(0, 1 - Math.abs(o) * 2).toFixed(3));
    });
    const j = ((Math.round(pos) % M) + M) % M;
    if (j !== front) setFront(j);
  };

  // Inertia first, then a spring onto the nearest card. The water ripples harder the faster it spins.
  let t = 0;
  const tick = () => {
    raf = 0;
    if (!dragging) {
      if (target === null) { pos += vel; vel *= 0.94; if (Math.abs(vel) < 0.02) target = Math.round(pos); }
      else { vel = (vel + (target - pos) * 0.07) * 0.8; pos += vel; }
    }
    if (!still) render(); // at rest only the water moves
    t += 0.02;
    if (!reduceMotion) {
      water.setAttribute("baseFrequency", `0.004 ${(0.06 + Math.sin(t) * 0.012).toFixed(4)}`);
      waterMap.setAttribute("scale", (16 + Math.min(40, Math.abs(vel) * 60)).toFixed(1));
    }
    const settled = target !== null && Math.abs(target - pos) < 0.002 && Math.abs(vel) < 0.002;
    if (settled && !dragging && !still) {
      pos = target; render(); still = true;
      // Count a project as viewed once the hall comes to rest on it, not for every card spun past.
      if (current !== tracked) { tracked = current; track("view_project", { event_category: "engagement", event_label: projects[current].textContent.trim() }); }
    }
    if (inView && (!settled || dragging || !reduceMotion)) raf = requestAnimationFrame(tick);
  };
  const run = () => { still = false; if (!raf && inView) raf = requestAnimationFrame(tick); };
  // Go to project i by the shortest way round, whichever copy of it is nearest.
  const go = (i) => {
    let best = null;
    for (let j = i; j < M; j += N) {
      const d = ((((j - pos) % M) + M + M / 2) % M) - M / 2;
      if (best === null || Math.abs(d) < Math.abs(best)) best = d;
    }
    target = pos + best;
    if (reduceMotion) { pos = target; vel = 0; render(); }
    run();
  };

  let dragging = false, lastX = 0, moved = 0, downCard = null;
  stage.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    dragging = true; moved = 0; lastX = e.clientX; vel = 0; target = null;
    downCard = e.target.closest(".hall-card");
    stage.setPointerCapture(e.pointerId);
    stage.classList.add("is-dragging");
    run();
  });
  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX; moved += Math.abs(dx);
    const step = -dx / gap;
    pos += step;
    vel = Math.max(-0.4, Math.min(0.4, vel * 0.5 + step * 0.5)); // a hard flick spins a few cards, not laps
  });
  // pointercancel means the browser took the touch over to scroll the page, so it is never a tap.
  const release = (tap) => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("is-dragging");
    if (tap && moved < 6 && downCard) go(cards.indexOf(downCard) % N);
    run();
  };
  stage.addEventListener("pointerup", () => release(true));
  stage.addEventListener("pointercancel", () => release(false));
  stage.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(current + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(current - 1); }
  });
  document.querySelectorAll(".hall-controls [data-dir]").forEach((b) => b.addEventListener("click", () => go(current + Number(b.dataset.dir))));
  dots.forEach((d) => d.addEventListener("click", () => go(Number(d.dataset.to))));

  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    if (inView) { setFront(front); run(); } else cards.forEach((c) => c.querySelector("video").pause());
  }).observe(stage);
  addEventListener("resize", layout);
  layout();
  // Old links like …/#project-3 open the hall on that project.
  const linked = location.hash.match(/^#project-(\d+)$/);
  if (linked && linked[1] >= 1 && linked[1] <= N) { pos = Number(linked[1]) - 1; tracked = pos; render(); }
})();

// Liquid images: on hover the photo ripples (its own SVG displacement filter, driven by a loose spring).
(() => {
  if (!finePointer || reduceMotion) return;
  const template = document.getElementById("liquid");
  document.querySelectorAll(".liquid-img").forEach((box, n) => {
    const filter = template.cloneNode(true);
    filter.id = `liquid-${n}`;
    template.parentNode.append(filter);
    box.querySelector("img").style.filter = `url(#${filter.id}) grayscale(var(--gray))`;
    const noise = filter.querySelector("feTurbulence"), map = filter.querySelector("feDisplacementMap");
    let x = 0, v = 0, goal = 0, raf = 0, last = 0;
    const step = (now) => {
      const dt = Math.min(0.032, (now - last) / 1000 || 0.016);
      last = now;
      v += (-140 * (x - goal) - 13 * v) * dt;
      x += v * dt;
      map.setAttribute("scale", (1 + 27 * x).toFixed(2));
      noise.setAttribute("baseFrequency", (0.009 + 0.013 * x).toFixed(4));
      raf = Math.abs(x - goal) < 0.001 && Math.abs(v) < 0.001 ? 0 : requestAnimationFrame(step);
    };
    const to = (g) => { goal = g; if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } };
    box.addEventListener("pointerenter", () => to(1));
    box.addEventListener("pointerleave", () => to(0));
  });
})();

// Résumé by email, sent through EmailJS. Falls back to the direct link if sending fails.
(() => {
  const form = document.getElementById("resumeRequestForm");
  if (!form) return;
  const input = form.querySelector("#resumeEmail");
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button");
  const env = window.ENV || {};
  if (window.emailjs && env.EMAILJS_USER_ID) window.emailjs.init(env.EMAILJS_USER_ID);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!input.checkValidity() || !email) {
      status.textContent = "That email address does not look right. Please check it.";
      input.focus();
      return;
    }
    if (/^(127\.0\.0\.1|localhost)$/.test(location.hostname) && !new URLSearchParams(location.search).has("live")) {
      status.textContent = "Preview: no email sent. On the live site this sends the résumé link.";
      return;
    }
    if (!window.emailjs) {
      status.innerHTML = `Email is not available right now. <a href="${RESUME_LINK}" target="_blank" rel="noopener">Download the résumé directly</a>.`;
      return;
    }
    button.disabled = true;
    button.textContent = "Sending…";
    status.textContent = "";
    try {
      await window.emailjs.send(env.EMAILJS_SERVICE_ID, env.EMAILJS_TEMPLATE_ID, {
        to_email: email,
        from_name: "Praveen Ganapathy Ravi",
        resume_link: RESUME_LINK,
        message: "Thank you for your interest in my portfolio!",
      });
      form.reset();
      status.innerHTML = `Sent. It is also <a href="${RESUME_LINK}" target="_blank" rel="noopener">here as a PDF</a>.`;
      track("resume_request", { event_category: "engagement", event_label: "Resume email" });
    } catch (err) {
      console.error("Email failed to send:", err);
      status.innerHTML = `That did not go through. <a href="${RESUME_LINK}" target="_blank" rel="noopener">Download the résumé directly</a> instead.`;
    } finally {
      button.disabled = false;
      button.textContent = "Send it";
    }
  });
})();
