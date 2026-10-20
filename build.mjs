// Builds index.html from data.js. Run after editing content: `node build.mjs`
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const ctx = {};
vm.runInNewContext(readFileSync(new URL("./data.js", import.meta.url), "utf8") + "\nthis.d = portfolioData;", ctx);
const d = ctx.d;
const { basics, page } = d;

const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const breakable = (s) => esc(s).replace(/([@/])/g, "$1<wbr>");
const yearOf = (period) => (period.match(/\d{4}/g) || []).pop() || "";
const shortPeriod = (p) => p.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w* /g, "$1 ").replace("Present", "now");
const pad = (n) => String(n).padStart(2, "0");
const ext = (href, text, cls = "link") => `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${esc(text)}</a>`;
const RESUME = "https://praveenganapathy.github.io/online-resume/PraveenGanapathyRavi_Resume.pdf";
const ARROW = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const eyebrow = (text) => `<p class="eyebrow"><span class="eyebrow-dot" aria-hidden="true"></span>${esc(text)}</p>`;
const [first, ...rest] = basics.name.split(" ");
const initials = basics.name.split(" ").slice(0, 2).map((w) => w[0]).join("");

// ---------- projects: the mirror hall (a draggable 3D ring) ----------
const title = (p) => p.title.replace(/ \(Hackathon Winner\)/, "");
const hallCards = d.projects.map((p, i) => `
            <li class="hall-card" style="--i:${i}" data-i="${i}">
              <video src="${esc(p.image)}.mp4" poster="${esc(p.image)}.jpg" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"></video>
              <span class="hall-card-name">${esc(title(p))}</span>
            </li>`).join("");
const hallInfo = d.projects.map((p, i) => `
          <article class="hall-info" id="project-${i + 1}" data-i="${i}"${i ? " hidden" : ""}>
            <div class="hall-info-row">
              <div>
                <h3>${esc(title(p))}</h3>
                <p class="hall-brief">${esc(p.brief)}</p>
              </div>
              <div class="hall-meta">
                <p class="nums">${esc(p.period)}</p>
                <p class="accent">${esc(p.kind)}${/Hackathon Winner/.test(p.title) ? " · 1st place" : ""}</p>
              </div>
            </div>
            <details class="card-more">
              <summary>More about this project</summary>
              <p>${esc(p.description)}</p>
              <p class="muted">${esc(p.association)}, ${esc(p.period)}. Built with ${esc(p.skills.join(", "))}.</p>
            </details>
            <p class="card-links">${ext(p.repo, "Source code", "pill")}${p.demo ? ext(p.demo, "Live demo", "pill pill-solid") : ""}</p>
          </article>`).join("");

// ---------- career ----------
const PLACES = {
  Now: { src: "assets/world-bank-building-at-washington.jpg", w: 1400, h: 1133, alt: "The World Bank Group's headquarters on a street in Washington, DC", credit: ["World Bank building at Washington", "Shiny Things", "CC BY 2.0", "https://commons.wikimedia.org/w/index.php?curid=2390362"] },
  Before: { src: "assets/tidel-park-chennai.jpg", w: 1400, h: 1050, alt: "Tidel Park, an IT park in Chennai, India", credit: ["Tidel Park Chennai", "Jbritto", "CC BY 2.5", "https://commons.wikimedia.org/w/index.php?curid=260475"] },
  "At university": { src: "assets/umass-dartmouth-campus-quad.jpg", w: 1400, h: 788, alt: "The campus quad at UMass Dartmouth, with its concrete campus center", credit: ["UMass Dartmouth Campus Quad", "UMassD Marketing", "CC0", "https://commons.wikimedia.org/w/index.php?curid=149508552"] },
};
const place = (label) => {
  const p = PLACES[label];
  if (!p) return "";
  const [title, by, lic, pageUrl] = p.credit;
  return `<figure class="place"><div class="liquid-img"><img src="${p.src}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" loading="lazy"><span class="liquid-glow" aria-hidden="true"></span></div><figcaption>“${esc(title)}” by ${esc(by)}, ${esc(lic)}, <a class="link" href="${pageUrl}" target="_blank" rel="noopener">via Wikimedia Commons</a></figcaption></figure>`;
};
const job = (e) => `
              <li>
                <details>
                  <summary><span class="dot" aria-hidden="true"></span><span class="row-name"><strong>${esc(e.title)}</strong> · ${esc(e.company)}</span><span class="row-value nums">${esc(shortPeriod(e.period))}</span></summary>
                  <div class="row-body">
                    <p class="muted">${esc(e.location)}</p>
                    <ul class="bullets">${e.details.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
                  </div>
                </details>
              </li>`;
const groups = [
  ["Now", d.experience.filter((e) => /Present/.test(e.period))],
  ["Before", d.experience.filter((e) => !/Present/.test(e.period) && !/University/.test(e.company))],
  ["At university", d.experience.filter((e) => !/Present/.test(e.period) && /University/.test(e.company))],
].map(([label, jobs], i) => `
          <li class="group" data-rise style="--d:${i}">
            <div class="group-list">
              <h3 class="group-label">${label}</h3>
              <ul class="rows">${jobs.map(job).join("")}
              </ul>
            </div>
            ${place(label)}
          </li>`).join("");

const edu = d.education.map((e) => `
              <li>
                <details>
                  <summary><span class="dot" aria-hidden="true"></span><span class="row-name"><strong>${esc(e.degree)}</strong> · ${esc(e.institution)}</span><span class="row-value nums">${esc(shortPeriod(e.period))}</span></summary>
                  <div class="row-body">
                    <p class="muted">${esc(e.location)} · GPA ${esc(e.gpa)}</p>
                    <ul class="bullets">${e.highlights.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
                    <p class="muted">Courses: ${esc(e.courses.join(", "))}.</p>
                  </div>
                </details>
              </li>`).join("");
const certs = d.certifications.map((c) => `
              <li class="plain"><span class="row-name">${c.credentialLink ? ext(c.credentialLink, c.title) : esc(c.title)} · ${esc(c.issuer)}</span><span class="row-value nums">${esc(c.date)}</span></li>`).join("");
const tools = d.skills.categories.map((c) => `
              <li class="tool"><h4>${esc(c.title)}</h4><p>${c.skills.map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</p></li>`).join("");

// Mileo. The wx-* layers are his weather outfits; weather.js picks one from the visitor's local weather.
const dog = (cls = "") => `<svg class="mileo-dog ${cls}" viewBox="0 0 120 120" aria-hidden="true">
  <g class="wx wx-umbrella">
    <path d="M60 -14V62" stroke="#cfe6ff" stroke-width="3" stroke-linecap="round"/>
    <path d="M2 4Q60 -52 118 4Q104 -4 89 4Q75 -4 60 4Q45 -4 31 4Q16 -4 2 4Z" fill="#0a84ff"/>
    <path d="M31 4Q38 -34 60 -26Q45 -4 31 4ZM89 4Q82 -34 60 -26Q75 -4 89 4Z" fill="#6fd3ff"/>
    <circle cx="60" cy="-27" r="3" fill="#cfe6ff"/>
  </g>
  <g class="wx wx-collar">
    <path d="M14 104Q60 128 106 104L112 124H8Z" fill="#0a84ff"/>
    <path d="M14 104Q60 128 106 104" fill="none" stroke="#6fd3ff" stroke-width="5" stroke-linecap="round"/>
    <path d="M60 116V124" stroke="#cfe6ff" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <g class="m-head">
    <ellipse class="m-ear m-ear-l" cx="27" cy="54" rx="15" ry="27" fill="#7a4a2c" transform="rotate(20 27 54)"/>
    <ellipse class="m-ear m-ear-r" cx="93" cy="54" rx="15" ry="27" fill="#7a4a2c" transform="rotate(-20 93 54)"/>
    <ellipse cx="60" cy="60" rx="36" ry="34" fill="#f2c27b"/>
    <ellipse cx="60" cy="38" rx="10" ry="14" fill="#fff4e2"/>
    <ellipse cx="60" cy="77" rx="22" ry="16" fill="#fff4e2"/>
    <circle cx="37" cy="72" r="5" fill="#ff9aa8" opacity="0.55"/><circle cx="83" cy="72" r="5" fill="#ff9aa8" opacity="0.55"/>
    <g class="m-eyes"><g class="m-eye"><circle cx="45" cy="57" r="5.5" fill="#1d1d2b"/><circle cx="46.8" cy="55" r="1.9" fill="#fff"/></g><g class="m-eye"><circle cx="75" cy="57" r="5.5" fill="#1d1d2b"/><circle cx="76.8" cy="55" r="1.9" fill="#fff"/></g></g>
    <g class="m-happy-eyes" fill="none" stroke="#1d1d2b" stroke-width="3.2" stroke-linecap="round"><path d="M39 58q6-7 12 0"/><path d="M69 58q6-7 12 0"/></g>
    <path d="M52 67q8-5 16 0q-1 7-8 9q-7-2-8-9z" fill="#1d1d2b"/>
    <path class="m-tongue" d="M55 82q5 13 10 0z" fill="#ff7d93"/>
    <path class="m-mouth" d="M51 80q9 7 9-2q0 9 9 2" fill="none" stroke="#1d1d2b" stroke-width="2.4" stroke-linecap="round"/>
    <g class="wx wx-beanie">
      <path d="M22 42Q26 6 60 4Q94 6 98 42Z" fill="#0a84ff"/>
      <rect x="18" y="36" width="84" height="12" rx="6" fill="#6fd3ff"/>
      <circle cx="60" cy="2" r="8" fill="#eef4ff"/>
    </g>
    <g class="wx wx-shades">
      <rect x="34" y="50" width="22" height="14" rx="5" fill="#0b1424"/><rect x="64" y="50" width="22" height="14" rx="5" fill="#0b1424"/>
      <path d="M56 55h8M34 54l-8-3M86 54l8-3" stroke="#0b1424" stroke-width="3" stroke-linecap="round"/>
      <path d="M38 53l6 0" stroke="#6fd3ff" stroke-width="2" stroke-linecap="round"/><path d="M68 53l6 0" stroke="#6fd3ff" stroke-width="2" stroke-linecap="round"/>
    </g>
  </g>
</svg>`;

const splitLetters = (word) => [...word].map((ch, i) => `<span class="ch" style="--c:${i}">${esc(ch)}</span>`).join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <style>html{background:#04060b;color:#eef4ff}</style>
  <title>Praveen Ganapathy Ravi, Data Engineer</title>
  <meta name="description" content="${esc(page.heroSentence)} Portfolio of work, projects and certifications.">
  <meta name="author" content="${esc(basics.name)}">
  <meta name="theme-color" content="#04060b">
  <link rel="canonical" href="https://praveenganapathy.github.io/portfolio/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://praveenganapathy.github.io/portfolio/">
  <meta property="og:title" content="Praveen Ganapathy Ravi, Data Engineer">
  <meta property="og:description" content="${esc(page.heroSentence)}">
  <meta property="og:image" content="https://praveenganapathy.github.io/portfolio/images/projects/doc_viz.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="images/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="images/icons-portfolio.png">
  <script src="env-config.js"></script>
  <script src="maintenance.js"></script>
  <script>(function(r){r.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches){r.classList.add('is-loading');setTimeout(function(){if(r.classList.contains('is-loading')){r.classList.remove('is-loading');r.classList.add('is-revealed')}},8000)}})(document.documentElement)</script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-T0VG76GE8V');addEventListener('load',function(){setTimeout(function(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=G-T0VG76GE8V';document.head.appendChild(s)},1500)});</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Onest:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="style.css">
  <script type="importmap">{ "imports": { "lenis": "https://cdn.jsdelivr.net/npm/lenis@1.3.19/dist/lenis.mjs" } }</script>
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: basics.name,
    url: "https://praveenganapathy.github.io/portfolio/",
    jobTitle: d.experience[0].title,
    worksFor: { "@type": "Organization", name: d.experience[0].company },
    alumniOf: d.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.institution })),
    sameAs: [`https://${basics.github}`, `https://${basics.linkedin}`],
  })}</script>
</head>
<body>
  <!-- generated by build.mjs from data.js; edit data.js, then run: node build.mjs -->
  <div class="preloader" id="preloader" aria-hidden="true">
    <p class="pre-brand">${esc(page.heroName.join(" "))}</p>
    <p class="pre-count nums"><span>0</span><em>%</em></p>
  </div>
  <svg class="defs" aria-hidden="true" width="0" height="0">
    <filter id="liquid" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="2" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="1"/></filter>
    <filter id="water" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.06" numOctaves="2" seed="3" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G"/></filter>
  </svg>

  <header class="nav">
    <nav aria-label="Sections">
      <a class="logo" href="#top"><span class="logo-badge">${esc(initials)}</span><span class="logo-name">${esc(basics.name)}</span></a>
      <ul class="nav-links">
        <li><a href="#projects">Projects</a></li><li><a href="#story">Story</a></li><li><a href="#impact">Impact</a></li><li><a href="#work">Work</a></li><li><a href="#contact">Contact</a></li>
      </ul>
      <button class="burger" type="button" aria-controls="menu" aria-expanded="false" aria-label="Open menu"><span></span><span></span><span></span></button>
    </nav>
  </header>
  <div class="menu" id="menu" hidden>
    <ul>
      <li style="--i:0"><a href="#projects">Projects</a></li><li style="--i:1"><a href="#story">Story</a></li><li style="--i:2"><a href="#impact">Impact</a></li><li style="--i:3"><a href="#work">Work</a></li><li style="--i:4"><a href="#contact">Contact</a></li>
    </ul>
  </div>

  <main>
    <section class="hero" id="top" aria-label="Introduction">
      <canvas class="weather" aria-hidden="true"></canvas>
      <div class="hero-top">
        <h2 class="hero-roles">${page.roles.map((r, i) => `<span class="line"><span style="--i:${i}">${esc(r)}</span></span>`).join("")}</h2>
        <div class="hero-side">
          <p class="hero-desc">${esc(page.heroSentence)}</p>
          <a class="pill pill-solid" href="${RESUME}" target="_blank" rel="noopener">Download résumé ${ARROW}</a>
        </div>
      </div>
      <div class="hero-fade" aria-hidden="true"></div>
      <h1 class="hero-name" aria-label="${esc(basics.name)}">${page.heroName.map((w, i) => `<span class="name-line" style="--l:${i}" aria-hidden="true">${splitLetters(w)}</span>`).join("")}</h1>
      <p class="scroll-cue"><span aria-hidden="true"></span>Scroll to enter</p>
    </section>

    <section class="marquee" aria-label="What I care about">
      <div class="marquee-track" aria-hidden="true">${[0, 1].map(() => page.marquee.map((w) => `<span class="mq-word">${esc(w)}</span><span class="mq-dot"></span>`).join("")).join("")}</div>
      <p class="sr-only">${esc(page.marquee.join(", "))}</p>
    </section>

    <section class="hall-section" id="projects" aria-labelledby="projects-head">
      <div class="section-head">
        <div>
          ${eyebrow("Selected Projects")}
          <h2 id="projects-head" class="heading" data-split>The things I have built.</h2>
        </div>
        <p class="head-label nums">${pad(d.projects.length)} / Projects</p>
      </div>
      <div class="hall" data-rise>
        <p class="hall-kicker">${esc(first)} · Collection Nº 01</p>
        <div class="hall-stage" tabindex="0" role="group" aria-roledescription="carousel" aria-label="Projects. Drag, or use the arrow keys, to spin the hall.">
          <div class="hall-view"><ul class="hall-ring">${hallCards}
          </ul></div>
          <div class="hall-mirror" aria-hidden="true"><div class="hall-view"><ul class="hall-ring"></ul></div></div>
        </div>
        <div class="hall-controls">
          <button class="round" type="button" data-dir="-1" aria-label="Previous project"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <p class="hall-count nums" aria-live="polite"><span>01</span> / ${pad(d.projects.length)}</p>
          <button class="round" type="button" data-dir="1" aria-label="Next project">${ARROW}</button>
        </div>
        <div class="dots" role="tablist" aria-label="Choose a project">${d.projects.map((p, i) => `<button type="button" role="tab" aria-label="${esc(title(p))}" aria-selected="${i === 0}" data-to="${i}"></button>`).join("")}</div>
      </div>
      <div class="hall-infos">${hallInfo}
      </div>
    </section>

    <section class="story" id="story" aria-labelledby="story-head">
      <div>
        ${eyebrow("The Story")}
        <h2 id="story-head" class="heading" data-split>${esc(page.intro.before)} ${esc(page.intro.accent)} ${esc(page.intro.after)}</h2>
        <p class="lead" data-rise>${esc(basics.about)}</p>
        <dl class="facts" data-rise style="--d:1">${page.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("")}</dl>
      </div>
      <ul class="principles">${page.record.map((r, i) => `
        <li data-rise style="--d:${i}"><span class="p-num nums">${pad(i + 1)}</span><div><h3>${esc(r.name)}</h3><p>${esc(r.value)}</p></div></li>`).join("")}${d.publications.map((p, i) => `
        <li data-rise style="--d:${page.record.length + i}"><span class="p-num nums">${pad(page.record.length + i + 1)}</span><div><h3>${ext(p.link, p.title)}</h3><p>${esc(p.publisher)}, ${esc(yearOf(p.date))}</p></div></li>`).join("")}
      </ul>
    </section>

    <section class="impact" id="impact" aria-labelledby="impact-head">
      ${eyebrow("By The Numbers")}
      <h2 id="impact-head" class="heading" data-split>The work, measured.</h2>
      <dl class="stats">${page.stats.map((s, i) => `
        <div data-rise style="--d:${i}"><dd class="stat-figure nums">${esc(s.value)}</dd><dt>${esc(s.label)}</dt></div>`).join("")}
      </dl>
    </section>

    <section class="career" id="work" aria-labelledby="work-head">
      ${eyebrow("Experience")}
      <h2 id="work-head" class="heading" data-split>Where I have worked.</h2>
      <ul class="groups">${groups}
        <li class="group" data-rise>
          <div class="group-list">
            <h3 class="group-label">Education</h3>
            <ul class="rows">${edu}
            </ul>
            <h3 class="group-label spaced">Certified</h3>
            <ul class="rows">${certs}
            </ul>
          </div>
        </li>
      </ul>
      <div class="tools" data-rise>
        <h3 class="group-label">Tools</h3>
        <ul class="tool-grid">${tools}
        </ul>
      </div>
    </section>

    <section class="visitors" id="visitors" aria-labelledby="visitors-head" hidden>
      ${eyebrow("Live")}
      <h2 id="visitors-head" class="heading">Who's visiting.</h2>
      <div class="v-grid">
        <div class="v-card v-main">
          <p class="v-total nums">0</p>
          <p class="v-unique muted"></p>
          <h3 class="group-label">Visits, last 30 days</h3>
          <div class="v-chart-wrap">
            <div class="v-tip" role="status" hidden></div>
            <div class="v-chart" role="group" aria-label="Daily visits, last 30 days"></div>
            <div class="v-axis"></div>
          </div>
          <p class="v-peak muted"></p>
        </div>
        <div class="v-card">
          <h3 class="group-label">Where from</h3>
          <ol class="v-list v-regions"></ol>
          <h3 class="group-label spaced">How they found me</h3>
          <ol class="v-list v-sources"></ol>
          <p class="v-note muted">Regions are approximate, from browser time zones. No IP addresses or personal details are stored.</p>
        </div>
      </div>
    </section>

    <footer class="contact" id="contact" aria-labelledby="contact-head">
      ${eyebrow("Let's Build")}
      <h2 id="contact-head" class="heading heading-xl" data-split>Have data that needs somewhere to go?</h2>
      <p class="lead" data-rise>I read every message I'm sent. Rather stay anonymous? Leave a note with Mileo.</p>
      <a class="mail" href="mailto:${esc(basics.email)}?subject=${encodeURIComponent("Hello from your portfolio")}" data-rise>${breakable(basics.email)} <span class="accent" aria-hidden="true">↗</span></a>
      <div class="contact-grid">
        <div class="contact-card" data-rise>
          <h3>Get the résumé by email</h3>
          <form id="resumeRequestForm" class="resume-form" novalidate>
            <label class="sr-only" for="resumeEmail">Your email address</label>
            <input class="field" id="resumeEmail" type="email" name="email" autocomplete="email" placeholder="you@company.com" required>
            <button class="pill pill-solid" type="submit">Send it</button>
            <p class="form-status" role="status" aria-live="polite"></p>
          </form>
        </div>
        <ul class="contact-card links" data-rise style="--d:1">
          <li><a href="https://${esc(basics.linkedin)}" target="_blank" rel="noopener"><span>LinkedIn</span><span class="muted">${breakable(basics.linkedin)}</span></a></li>
          <li><a href="https://${esc(basics.github)}" target="_blank" rel="noopener"><span>GitHub</span><span class="muted">${breakable(basics.github)}</span></a></li>
          <li><a href="${RESUME}" target="_blank" rel="noopener"><span>Résumé</span><span class="muted">PDF</span></a></li>
          <li><span><span>Based in</span><span class="muted">${esc(d.contact.location)}</span></span></li>
          <li><a href="#mileo" data-open-mileo><span>Rather not share your details?</span><span class="muted">Tell Mileo 🐾</span></a></li>
        </ul>
      </div>
      <div class="foot-bar">
        <div>
          <p class="signature">${esc(page.heroName.join(" "))}</p>
          <p class="eyebrow-text">Designed &amp; built in ${esc(d.contact.location)}.</p>
        </div>
        <nav aria-label="Social">
          <ul class="socials">
            <li><a href="https://${esc(basics.linkedin)}" target="_blank" rel="noreferrer noopener">LinkedIn</a></li>
            <li><a href="https://${esc(basics.github)}" target="_blank" rel="noreferrer noopener">GitHub</a></li>
            <li><a href="#top">Back to top</a></li>
          </ul>
        </nav>
        <p class="eyebrow-text copy">© ${new Date().getFullYear()} ${esc(basics.name)}. All rights reserved.</p>
      </div>
    </footer>
  </main>

  <button class="mileo-launch" type="button" aria-controls="mileo" aria-expanded="false" aria-label="Talk to Mileo, Praveen's dog-bot: feed him, cuddle him or leave Praveen a note">
    <span class="mileo-avatar">${dog()}</span>
    <span class="mileo-label"><strong>Mileo</strong><span>Feed me · leave a note</span></span>
    <span class="mileo-badge" aria-hidden="true">1</span>
    <span class="mileo-bubble" aria-hidden="true">Woof! I'm Mileo 👋</span>
  </button>
  <div class="mileo" id="mileo" role="dialog" aria-labelledby="mileo-title" hidden>
    <button class="mileo-close round" type="button" aria-label="Close Mileo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
    <div class="mileo-top">
      <button class="mileo-face" type="button" aria-label="Pet Mileo">${dog("big")}</button>
      <div>
        <h2 id="mileo-title">Mileo</h2>
        <p class="muted">Praveen's very good dog-bot</p>
      </div>
    </div>
    <p class="mileo-wx" hidden></p>
    <p class="mileo-says" aria-live="polite"></p>
    <div class="mileo-burst" aria-hidden="true"></div>
    <div class="mileo-tabs" role="tablist" aria-label="What to do with Mileo">
      <button type="button" role="tab" id="tab-feed" data-tab="feed" aria-controls="mp-feed" aria-selected="true">Feed</button>
      <button type="button" role="tab" id="tab-cuddle" data-tab="cuddle" aria-controls="mp-cuddle" aria-selected="false" tabindex="-1">Cuddle</button>
      <button type="button" role="tab" id="tab-note" data-tab="note" aria-controls="mp-note" aria-selected="false" tabindex="-1">Leave a note</button>
    </div>
    <div class="mileo-pane" id="mp-feed" role="tabpanel" aria-labelledby="tab-feed">
      <div class="food">
        <button type="button" data-food="bone"><span aria-hidden="true">🦴</span>Bone</button>
        <button type="button" data-food="kibble"><span aria-hidden="true">🥣</span>Kibble</button>
        <button type="button" data-food="carrot"><span aria-hidden="true">🥕</span>Carrot</button>
        <button type="button" data-food="cookie"><span aria-hidden="true">🍪</span>Cookie</button>
      </div>
    </div>
    <div class="mileo-pane" id="mp-cuddle" role="tabpanel" aria-labelledby="tab-cuddle" hidden>
      <button class="mileo-cuddle pill pill-solid" type="button">Give Mileo a cuddle <span aria-hidden="true">🤗</span></button>
    </div>
    <div class="mileo-pane" id="mp-note" role="tabpanel" aria-labelledby="tab-note" hidden>
      <form class="mileo-note" novalidate>
        <label for="mileo-message">Your note for Praveen</label>
        <textarea id="mileo-message" name="message" rows="3" maxlength="1000" required placeholder="Hi Praveen, loved your pipeline work…"></textarea>
        <label for="mileo-reply">Your email <span class="muted">(only if you want a reply)</span></label>
        <input id="mileo-reply" name="reply" type="email" autocomplete="email" placeholder="optional">
        <button class="pill pill-solid" type="submit">Give the note to Mileo</button>
        <p class="mileo-note-status" role="status" aria-live="polite"></p>
      </form>
    </div>
    <div class="mileo-foot">
      <p class="mileo-status"></p>
      <p class="mileo-counts"><span aria-hidden="true">🦴</span> <span class="mileo-feeds nums">0</span> meals · <span aria-hidden="true">💙</span> <span class="mileo-cuddles nums">0</span> cuddles</p>
    </div>
  </div>

  <script defer src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3.11.0/dist/email.min.js"></script>
  <script defer src="backend.js"></script>
  <script defer src="weather.js"></script>
  <script defer src="main.js"></script>
  <script defer src="insights.js"></script>
  <script defer src="mileo.js"></script>
  <script type="module">
    import Lenis from "lenis";
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const lenis = new Lenis({ smoothWheel: true });
      window.lenis = lenis;
      if (document.documentElement.classList.contains("is-loading")) lenis.stop();
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  </script>
</body>
</html>
`;

writeFileSync(new URL("./index.html", import.meta.url), html);
console.log(`index.html written: ${d.experience.length} jobs, ${d.projects.length} projects, ${d.certifications.length} certifications`);
