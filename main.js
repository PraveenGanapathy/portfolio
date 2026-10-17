// Portfolio behaviour: reveals, glass lens, project deck, résumé form.
// The page is complete without this file; every part here only adds to it.

const RESUME_LINK = (window.ENV && window.ENV.RESUME_LINK) || "https://praveenganapathy.github.io/online-resume/PraveenGanapathyRavi_Resume.pdf";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const track = (name, params) => { if (typeof window.gtag === "function") window.gtag("event", name, params); };

// Chromium can refract the backdrop through an SVG filter; elsewhere the lens falls back to blur.
if (window.chrome && CSS.supports("backdrop-filter", "url(#glass-lens)")) document.documentElement.classList.add("svg-glass");

// Reveal each block once as it enters the viewport.
(() => {
  const targets = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) { targets.forEach((el) => el.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-in");
      io.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
  targets.forEach((el) => io.observe(el));
  window.addEventListener("load", () => setTimeout(() => {
    targets.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add("is-in"); });
  }, 2500));
})();

// Highlight the nav link of the section in view.
(() => {
  const links = [...document.querySelectorAll(".nav-links a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href")));
  if (!("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) links.forEach((a, i) => a.classList.toggle("is-current", sections[i] === e.target));
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => s && io.observe(s));
})();

// The glass lens: follows the pointer over the headline; on touch screens it drifts on its own.
(() => {
  const hero = document.querySelector(".hero");
  const lens = hero && hero.querySelector(".lens");
  const title = hero && hero.querySelector(".hero-title");
  if (!lens || reduceMotion) return;
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0, auto = !finePointer, t0 = performance.now();
  const size = () => lens.offsetWidth;
  const place = () => {
    const r = title.getBoundingClientRect(), h = hero.getBoundingClientRect();
    tx = r.left - h.left + r.width * 0.35; ty = r.top - h.top + r.height * 0.3;
    x = tx; y = ty;
  };
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    if (auto) {
      const r = title.getBoundingClientRect(), h = hero.getBoundingClientRect(), s = (now - t0) / 1000;
      tx = r.left - h.left + r.width * (0.5 + 0.38 * Math.sin(s * 0.35));
      ty = r.top - h.top + r.height * (0.5 + 0.32 * Math.sin(s * 0.62 + 1));
    }
    x += (tx - x) * 0.12; y += (ty - y) * 0.12;
    lens.style.transform = `translate3d(${x - size() / 2}px, ${y - size() / 2}px, 0)`;
  };
  place();
  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    auto = false;
    const h = hero.getBoundingClientRect();
    tx = e.clientX - h.left; ty = e.clientY - h.top;
    lens.classList.add("is-on");
  });
  hero.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") auto = true; });
  // Run only while the hero is on screen.
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { lens.classList.add("is-on"); raf = requestAnimationFrame(loop); }
    else cancelAnimationFrame(raf);
  }).observe(hero);
})();

// Project deck: swipe on touch, arrows and dots everywhere; plays only the card in front.
(() => {
  const trackEl = document.querySelector(".deck-track");
  if (!trackEl) return;
  const cards = [...trackEl.children];
  const dots = [...document.querySelectorAll(".dots button")];
  const count = document.querySelector(".deck-count");
  let current = 0;

  const setCurrent = (i) => {
    current = i;
    cards.forEach((c, j) => {
      c.classList.toggle("is-away", j !== i);
      const v = c.querySelector("video");
      if (j === i && !reduceMotion) { v.preload = "auto"; v.play().catch(() => {}); } else v.pause();
    });
    dots.forEach((d, j) => d.setAttribute("aria-selected", String(j === i)));
    count.textContent = `${i + 1} / ${cards.length}`;
  };
  const go = (i) => {
    i = Math.max(0, Math.min(cards.length - 1, i));
    const left = cards[i].offsetLeft - cards[0].offsetLeft;
    trackEl.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
    setCurrent(i);
    track("view_project", { event_category: "engagement", event_label: cards[i].querySelector("h3").textContent });
  };

  // Work out which card is in front from the scroll position (covers swipes and trackpads).
  let ticking = false;
  trackEl.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const origin = trackEl.getBoundingClientRect().left;
      let best = 0, bestD = Infinity;
      cards.forEach((c, j) => { const d = Math.abs(c.getBoundingClientRect().left - origin - 4); if (d < bestD) { bestD = d; best = j; } });
      if (best !== current) setCurrent(best);
    });
  }, { passive: true });

  document.querySelectorAll(".deck-controls [data-dir]").forEach((b) => b.addEventListener("click", () => go(current + Number(b.dataset.dir))));
  dots.forEach((d) => d.addEventListener("click", () => go(Number(d.dataset.to))));
  trackEl.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(current + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(current - 1); }
  });
  trackEl.tabIndex = 0;
  cards.forEach((c, j) => c.addEventListener("click", (e) => { if (j !== current && !e.target.closest("a, summary")) go(j); }));

  // Start the front video only once the deck is on screen.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => {
      const v = cards[current].querySelector("video");
      if (e.isIntersecting) setCurrent(current); else v.pause();
    }, { threshold: 0.25 }).observe(trackEl);
  } else setCurrent(0);
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
