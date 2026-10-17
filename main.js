// Portfolio behaviour: reveals, project preview, tool filter, résumé form.
// The page is complete without this file; every part here only adds to it.

const RESUME_LINK = (window.ENV && window.ENV.RESUME_LINK) || "https://praveenganapathy.github.io/online-resume/PraveenGanapathyRavi_Resume.pdf";
const track = (name, params) => { if (typeof window.gtag === "function") window.gtag("event", name, params); };

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
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
  targets.forEach((el) => io.observe(el));
  // Safety net: never leave something on screen hidden if the observer did not fire.
  window.addEventListener("load", () => setTimeout(() => {
    targets.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add("is-in"); });
  }, 2500));
})();

// Play looping recordings only while they are on screen.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const videos = document.querySelectorAll(".band-video, .row-media video, .preview-video");
  if (reduce || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting && target.offsetParent !== null) target.play().catch(() => {});
      else target.pause();
    }
  }, { threshold: 0.2 });
  videos.forEach((v) => io.observe(v));
})();

// Project ledger: hovering or focusing a row shows its recording beside the column.
(() => {
  const preview = document.querySelector(".preview");
  const video = preview && preview.querySelector("video");
  const list = document.querySelector(".ledger-rows");
  if (!video || !list) return;
  const wrap = document.querySelector(".ledger-wrap");
  let current = list.querySelector(".row")?.dataset.media;
  let swap;

  const show = (row) => {
    const top = row.getBoundingClientRect().top - wrap.getBoundingClientRect().top;
    preview.style.transform = `translateY(${Math.max(0, top - 8)}px)`;
    const media = row.dataset.media;
    if (media === current) return;
    current = media;
    preview.classList.add("is-swapping");
    clearTimeout(swap);
    swap = setTimeout(() => {
      video.poster = `${media}.jpg`;
      video.src = `${media}.mp4`;
      video.play().catch(() => {});
      preview.classList.remove("is-swapping");
    }, 150);
  };
  list.querySelectorAll(".row").forEach((row) => {
    row.addEventListener("mouseenter", () => show(row));
    row.addEventListener("focusin", () => show(row));
  });
  list.addEventListener("toggle", (e) => {
    const row = e.target.closest(".row");
    if (e.target.open && row) {
      show(row);
      track("view_project", { event_category: "engagement", event_label: row.querySelector(".row-name").textContent });
    }
  }, true);
})();

// The live thing: show only the projects that used a chosen tool.
(() => {
  const chips = document.querySelectorAll(".chip");
  const rows = document.querySelectorAll(".ledger-rows .row");
  const count = document.querySelector(".filter-count");
  if (!chips.length) return;
  chips.forEach((chip) => chip.addEventListener("click", () => {
    const tool = chip.dataset.tool;
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    let shown = 0;
    rows.forEach((row) => {
      const match = !tool || row.dataset.tools.split("|").includes(tool);
      row.classList.toggle("is-out", !match);
      if (match) shown++;
    });
    count.textContent = tool ? `${shown} of ${rows.length} projects in ${tool.toLowerCase()}` : `All ${rows.length} projects`;
    const first = [...rows].find((r) => !r.classList.contains("is-out"));
    if (first && matchMedia("(hover: hover)").matches) first.dispatchEvent(new Event("mouseenter"));
    if (tool) track("filter_projects", { event_category: "engagement", event_label: tool });
  }));
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
