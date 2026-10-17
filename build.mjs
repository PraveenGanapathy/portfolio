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
const ext = (href, text, cls = "link") => `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${esc(text)}</a>`;
const RESUME = "https://praveenganapathy.github.io/online-resume/PraveenGanapathyRavi_Resume.pdf";
const ARROW = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ---------- projects: one card stack ----------
const cards = d.projects.map((p, i) => `
          <li class="card glass" style="--n:${i}" id="project-${i + 1}" aria-roledescription="slide" aria-label="${i + 1} of ${d.projects.length}: ${esc(p.title)}">
            <div class="card-head">
              <h3>${esc(p.title.replace(/ \(Hackathon Winner\)/, ""))}</h3>
              <span class="card-year nums">${yearOf(p.period)}</span>
            </div>
            <div class="card-media">
              <video src="${esc(p.image)}.mp4" poster="${esc(p.image)}.jpg" muted loop playsinline preload="none" aria-label="Screen recording of ${esc(p.title)}"></video>
            </div>
            <p class="card-kind">${esc(p.kind)}${/Hackathon Winner/.test(p.title) ? " · first place, Jia.Seed hackathon" : ""}</p>
            <p class="card-brief">${esc(p.brief)}</p>
            <details class="card-more">
              <summary>More about this project</summary>
              <p>${esc(p.description)}</p>
              <p class="muted">${esc(p.association)}, ${esc(p.period)}. Built with ${esc(p.skills.join(", "))}.</p>
            </details>
            <p class="card-links">${ext(p.repo, "Source code", "pill")}${p.demo ? ext(p.demo, "Live demo", "pill pill-solid") : ""}</p>
          </li>`).join("");

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
  return `<figure class="place"><img src="${p.src}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" loading="lazy"><figcaption>“${esc(title)}” by ${esc(by)}, ${esc(lic)}, <a class="link" href="${pageUrl}" target="_blank" rel="noopener">via Wikimedia Commons</a></figcaption></figure>`;
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
].map(([label, jobs]) => `
          <li class="group glass">
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

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Praveen Ganapathy Ravi, Data Engineer</title>
  <meta name="description" content="${esc(page.heroSentence)} Portfolio of work, projects and certifications.">
  <meta name="author" content="${esc(basics.name)}">
  <meta name="theme-color" content="#04070f">
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
  <script>document.documentElement.classList.add('js')</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
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
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-T0VG76GE8V"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-T0VG76GE8V');</script>
</head>
<body>
  <!-- generated by build.mjs from data.js; edit data.js, then run: node build.mjs -->
  <canvas class="liquid" aria-hidden="true"></canvas>
  <div class="grain" aria-hidden="true"></div>
  <svg class="defs" aria-hidden="true" width="0" height="0">
    <filter id="glass-lens" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.016" numOctaves="2" seed="7" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="34" xChannelSelector="R" yChannelSelector="G" result="dr"/>
      <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="42" xChannelSelector="R" yChannelSelector="G" result="dg"/>
      <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="52" xChannelSelector="R" yChannelSelector="G" result="db"/>
      <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/>
      <feBlend in="r" in2="g" mode="screen" result="rg"/>
      <feBlend in="rg" in2="b" mode="screen"/>
    </filter>
  </svg>

  <header class="nav">
    <a class="brand" href="#top">${esc(basics.name.split(" ")[0])}<span class="brand-rest"> ${esc(basics.name.split(" ").slice(1).join(" "))}</span></a>
    <nav aria-label="Sections" class="nav-links glass">
      <a href="#projects">Projects</a><a href="#work">Work</a><a href="#contact">Contact</a>
    </nav>
  </header>

  <section class="hero" id="top" aria-label="Introduction" data-energy="0.42">
    <h1 class="hero-title" aria-label="${esc(basics.name)}, ${esc(page.hero.top)} ${esc(page.hero.accent)} ${esc(page.hero.bottom)}">
      <span class="ht-line ht-top"><span data-line style="--i:0">${esc(page.hero.top)}</span></span>
      <span class="ht-accent"><span data-line style="--i:1">${esc(page.hero.accent)}</span></span>
      <span class="ht-line ht-bottom"><span data-line style="--i:2">${esc(page.hero.bottom)}</span></span>
    </h1>
    <div class="lens" aria-hidden="true"></div>
    <div class="hero-foot" data-rise style="--i:3">
      <dl class="hero-info">${page.heroInfo.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join("")}</dl>
      <a class="pill pill-solid pill-lg" href="${RESUME}" target="_blank" rel="noopener">Download résumé ${ARROW}</a>
    </div>
  </section>

  <main>
    <section class="showcase" id="projects" aria-labelledby="intro-text" data-energy="1">
      <div class="intro">
        <p id="intro-text" class="statement" data-reveal>${esc(page.intro.before)} <em>${esc(page.intro.accent)}</em> ${esc(page.intro.after)}</p>
        <p class="intro-sub" data-reveal style="--d:1">Seven things I have built, from deep learning to data pipelines. Swipe or use the arrows.</p>
        <div class="deck-controls" data-reveal style="--d:2">
          <button class="round glass" type="button" data-dir="-1" aria-label="Previous project"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <button class="round glass" type="button" data-dir="1" aria-label="Next project">${ARROW}</button>
          <p class="deck-count nums" aria-live="polite">1 / ${d.projects.length}</p>
        </div>
      </div>
      <div class="deck" data-reveal style="--d:1">
        <ol class="deck-track" aria-label="Projects">${cards}
        </ol>
        <div class="dots" role="tablist" aria-label="Choose a project">${d.projects.map((p, i) => `<button type="button" role="tab" aria-label="${esc(p.title)}" aria-selected="${i === 0}" data-to="${i}"></button>`).join("")}</div>
      </div>
    </section>

    <section class="about" id="about" aria-labelledby="about-head" data-energy="0.6">
      <div class="about-card glass" data-reveal>
        <h2 id="about-head" class="section-title">About</h2>
        <p class="about-text">${esc(basics.about)}</p>
        <dl class="facts">${page.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("")}</dl>
      </div>
      <div class="record glass" data-reveal style="--d:1">
        <h3 class="group-label">Record</h3>
        <ul class="record-list">${page.record.map((r) => `<li><span>${esc(r.name)}</span><span class="muted nums">${esc(r.value)}</span></li>`).join("")}${d.publications.map((p) => `<li><span>${ext(p.link, p.title)}</span><span class="muted nums">${esc(yearOf(p.date))}</span></li>`).join("")}</ul>
      </div>
    </section>

    <section class="career" id="work" aria-labelledby="work-head" data-energy="0.38">
      <h2 id="work-head" class="section-title big" data-reveal>Where I have <em>worked</em></h2>
      <ul class="groups" data-reveal>${groups}
        <li class="group glass">
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
      <div class="tools glass" data-reveal>
        <h3 class="group-label">Tools</h3>
        <ul class="tool-grid">${tools}
        </ul>
      </div>
    </section>

    <section class="contact" id="contact" aria-labelledby="contact-head" data-energy="0.8">
      <h2 id="contact-head" class="section-title big" data-reveal>Let's <em>talk</em></h2>
      <a class="contact-mail" href="mailto:${esc(basics.email)}?subject=${encodeURIComponent("Hello from your portfolio")}" data-reveal>${breakable(basics.email)} <span class="round glass">${ARROW}</span></a>
      <div class="contact-grid">
        <div class="glass contact-card" data-reveal>
          <h3>Get the résumé by email</h3>
          <form id="resumeRequestForm" class="resume-form" novalidate>
            <label class="sr-only" for="resumeEmail">Your email address</label>
            <input class="field" id="resumeEmail" type="email" name="email" autocomplete="email" placeholder="you@company.com" required>
            <button class="pill pill-solid" type="submit">Send it</button>
            <p class="form-status" role="status" aria-live="polite"></p>
          </form>
        </div>
        <ul class="glass contact-card links" data-reveal style="--d:1">
          <li><a href="https://${esc(basics.linkedin)}" target="_blank" rel="noopener"><span>LinkedIn</span><span class="muted">${breakable(basics.linkedin)}</span></a></li>
          <li><a href="https://${esc(basics.github)}" target="_blank" rel="noopener"><span>GitHub</span><span class="muted">${breakable(basics.github)}</span></a></li>
          <li><a href="${RESUME}" target="_blank" rel="noopener"><span>Résumé</span><span class="muted">PDF</span></a></li>
          <li><span><span>Based in</span><span class="muted">${esc(d.contact.location)}</span></span></li>
        </ul>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="legal"><span>© ${new Date().getFullYear()} ${esc(basics.name)}</span><a class="link" href="#top">Back to top</a></div>
    <p class="wordmark" aria-hidden="true">${esc(basics.name.split(" ")[0])}</p>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3.11.0/dist/email.min.js"></script>
  <script src="liquid.js"></script>
  <script src="main.js"></script>
</body>
</html>
`;

writeFileSync(new URL("./index.html", import.meta.url), html);
console.log(`index.html written: ${d.experience.length} jobs, ${d.projects.length} projects, ${d.certifications.length} certifications`);
