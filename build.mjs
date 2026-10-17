// Builds index.html from data.js. Run after editing content: `node build.mjs`
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const ctx = {};
vm.runInNewContext(readFileSync(new URL("./data.js", import.meta.url), "utf8") + "\nthis.d = portfolioData;", ctx);
const d = ctx.d;
const { basics, page } = d;

const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const yearOf = (period) => (period.match(/\d{4}/g) || []).pop() || "";
const shortPeriod = (p) => p.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w* /g, "$1 ").replace("Present", "now");
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const breakable = (s) => esc(s).replace(/([@/])/g, "$1<wbr>");
const ext = (href, text) => `<a class="link" href="${esc(href)}" target="_blank" rel="noopener">${esc(text)}</a>`;
const RESUME = "https://praveenganapathy.github.io/online-resume/PraveenGanapathyRavi_Resume.pdf";

// Areas offered in the project filter; each project belongs to every area its tools fall in.
const AREAS = {
  Python: ["Python"],
  "Machine learning": ["TensorFlow", "Deep Learning", "CNN", "Machine Learning", "NLP", "XGBoost", "Scikit-learn", "AI/LLM"],
  Visualization: ["D3.js", "Streamlit", "Power BI"],
  "Web apps": ["Django", "Flask", "Next.js", "React", "Node.js", "JavaScript", "Shadcn", "Ajax", "HTML/CSS"],
  "Cloud and pipelines": ["Apache Airflow", "AWS S3", "Azure", "Docker"],
};
const areasOf = (skills) => Object.keys(AREAS).filter((a) => skills.some((s) => AREAS[a].includes(s)));
const tools = Object.keys(AREAS);

const video = (p, cls = "", eager = false) => `<video class="${cls}" src="${esc(p.image)}.mp4" poster="${esc(p.image)}.jpg" muted loop playsinline ${eager ? "autoplay" : 'preload="none"'} aria-label="Screen recording of ${esc(p.title)}"></video>`;

const projectRows = d.projects.map((p, i) => `
        <li class="row" data-tools="${esc(areasOf(p.skills).join("|"))}" data-media="${esc(p.image)}" style="--i:${i}">
          ${i < 3 ? `<div class="row-media only-phone">${video(p)}</div>` : ""}
          <details>
            <summary>
              <span class="row-name">${esc(p.title)}</span>
              <span class="row-kind">${esc(p.kind)}</span>
              <span class="row-year nums">${yearOf(p.period)}</span>
            </summary>
            <div class="row-body">
              <p>${esc(p.description)}</p>
              <p class="muted">${esc(p.association)}, ${esc(p.period)}. Built with ${esc(p.skills.join(", "))}.</p>
              <p class="row-links">${ext(p.repo, "Source code")}${p.demo ? ext(p.demo, "Live demo") : ""}</p>
            </div>
          </details>
        </li>`).join("");

// Photographs of the places, from Wikimedia Commons; credits are shown under each one.
const PLACES = {
  Now: { src: "assets/world-bank-building-at-washington.jpg", w: 1400, h: 1133, alt: "The World Bank Group's headquarters on a street in Washington, DC", credit: ["World Bank building at Washington", "Shiny Things", "CC BY 2.0", "https://commons.wikimedia.org/w/index.php?curid=2390362"] },
  Before: { src: "assets/tidel-park-chennai.jpg", w: 1400, h: 1050, alt: "Tidel Park, an IT park in Chennai, India", credit: ["Tidel Park Chennai", "Jbritto", "CC BY 2.5", "https://commons.wikimedia.org/w/index.php?curid=260475"] },
  "At university": { src: "assets/umass-dartmouth-campus-quad.jpg", w: 1400, h: 788, alt: "The campus quad at UMass Dartmouth, with its concrete campus center", credit: ["UMass Dartmouth Campus Quad", "UMassD Marketing", "CC0", "https://commons.wikimedia.org/w/index.php?curid=149508552"] },
};
const place = (label) => {
  const p = PLACES[label];
  if (!p) return "";
  const [title, by, lic, page] = p.credit;
  return `<figure class="place"><img src="${p.src}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" loading="lazy"><figcaption class="small">“${esc(title)}” by ${esc(by)}, ${esc(lic)}, <a class="link" href="${page}" target="_blank" rel="noopener">via Wikimedia Commons</a></figcaption></figure>`;
};

const jobGroups = [
  ["Now", d.experience.filter((e) => /Present/.test(e.period))],
  ["Before", d.experience.filter((e) => !/Present/.test(e.period) && !/University/.test(e.company))],
  ["At university", d.experience.filter((e) => !/Present/.test(e.period) && /University/.test(e.company))],
];
const jobRows = jobGroups.map(([label, jobs]) => `
        <li class="group">
          ${place(label)}
          <p class="group-label">${label}</p>
          <ul class="rows">${jobs.map((e) => `
            <li>
              <details>
                <summary><span class="dot" aria-hidden="true"></span><span class="two-name"><strong>${esc(e.title)}</strong>, ${esc(e.company)}</span><span class="two-value nums">${esc(shortPeriod(e.period))}</span></summary>
                <div class="two-body">
                  <p class="muted">${esc(e.location)}</p>
                  <ul class="bullets">${e.details.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
                </div>
              </details>
            </li>`).join("")}
          </ul>
        </li>`).join("");

const eduRows = d.education.map((e) => `
            <li>
              <details>
                <summary><span class="dot" aria-hidden="true"></span><span class="two-name"><strong>${esc(e.degree)}</strong>, ${esc(e.institution)}</span><span class="two-value nums">${esc(shortPeriod(e.period))}</span></summary>
                <div class="two-body">
                  <p class="muted">${esc(e.location)} · GPA ${esc(e.gpa)}</p>
                  <ul class="bullets">${e.highlights.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
                  <p class="muted">Courses: ${esc(e.courses.join(", "))}.</p>
                </div>
              </details>
            </li>`).join("");

const certRows = d.certifications.map((c) => `
            <li class="plain"><span class="two-name">${c.credentialLink ? ext(c.credentialLink, c.title) : esc(c.title)}, ${esc(c.issuer)}</span><span class="two-value nums">${esc(c.date)}</span></li>`).join("");

const skillRows = d.skills.categories.map((c) => `
            <li class="plain"><span class="two-name"><strong>${esc(c.title)}</strong>: ${esc(c.skills.join(", "))}</span></li>`).join("");

const contactRows = [
  [`mailto:${basics.email}`, basics.email],
  [`https://${basics.linkedin}`, basics.linkedin],
  [`https://${basics.github}`, basics.github],
  [RESUME, "Résumé, PDF"],
  [null, d.contact.location],
];

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Praveen Ganapathy Ravi, Data Engineer</title>
  <meta name="description" content="${esc(page.heroSentence)} Portfolio of work, projects and certifications.">
  <meta name="author" content="${esc(basics.name)}">
  <meta name="theme-color" content="#9c1220">
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
  <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;500;900&display=swap" rel="stylesheet">
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
  <header class="hero field-red" id="top">
    <div class="topbar">
      <a class="mono link" href="#top" aria-label="Praveen Ganapathy Ravi, back to top">PGR</a>
      <nav aria-label="Sections"><a class="link" href="#work">Work</a><a class="link" href="#projects">Projects</a><a class="link" href="#contact">Contact</a></nav>
    </div>
    <h1 class="hero-name lines" aria-label="${esc(basics.name)}">
      <span class="line"><span data-line style="--i:0">${esc(page.heroLines[0])}</span></span>
      <span class="line second"><span data-line style="--i:1">${esc(page.heroLines[1])}</span></span>
    </h1>
    <div class="hero-foot" data-rise style="--i:3">
      <p class="lead">${esc(page.heroSentence)}</p>
      <a class="button" href="${RESUME}" target="_blank" rel="noopener">Download résumé</a>
    </div>
  </header>

  <main>
    <section class="stat field-pink" aria-labelledby="stat-claim">
      <h2 id="stat-claim" class="lead-head" data-reveal>${esc(page.stat.claim)}</h2>
      <div class="stat-figure" data-reveal>
        <p class="figure nums">${esc(page.stat.figure)}<sup>${esc(page.stat.unit)}</sup></p>
        <p class="caption">${esc(page.stat.caption)}</p>
      </div>
      <p class="stat-source small" data-reveal>${esc(page.stat.source)}</p>
    </section>

    <section class="flow field-red" aria-labelledby="flow-head">
      <div class="flow-top">
        <h2 id="flow-head" class="lead-head" data-reveal>${esc(page.flow.heading)}</h2>
        <p data-reveal style="--d:1">${esc(page.flow.text)}</p>
      </div>
      <div class="specimens">
        <p class="specimen" data-reveal><span class="sr-only">${esc(page.flow.from.label)} </span><span class="spec-word">${esc(page.flow.from.word)}</span></p>
        <p class="specimen" data-reveal style="--d:1"><span class="sr-only">${esc(page.flow.to.label)} </span><span class="spec-word">${esc(page.flow.to.word)}</span></p>
      </div>
    </section>

    <section class="about field-deep" id="about" aria-label="About">
      <div class="about-row">
        <dl class="facts" data-reveal>${page.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("")}</dl>
        <p class="about-text" data-reveal style="--d:1">${esc(basics.about)}</p>
      </div>
      <div class="about-row record">
        <p class="record-word" data-reveal>Record</p>
        <ul class="record-list" data-reveal style="--d:1">${page.record.map((r) => `<li><span>${esc(r.name)}</span><span class="muted nums">${esc(r.value)}</span></li>`).join("")}</ul>
        <ul class="record-list" data-reveal style="--d:2">${d.publications.map((p) => `<li><span>${ext(p.link, p.title)}</span><span class="muted nums">${esc(yearOf(p.date))}</span></li>`).join("")}${d.social.map((s) => `<li><span>${ext(s.url, s.platform)}</span><span class="muted">profile</span></li>`).join("")}</ul>
      </div>
    </section>

    <section class="projects field-charcoal" id="projects" aria-labelledby="projects-head">
      <figure class="band" data-reveal>
        <div class="band-frame">${video(d.projects.find((p) => /SimuChat/.test(p.title)), "band-video", true)}</div>
        <figcaption class="small">SimuChat, the AI roleplay game that took first place at the Jia.Seed hackathon.</figcaption>
      </figure>
      <div class="ledger-wrap">
        <div class="ledger">
          <h2 id="projects-head" class="lead-head" data-reveal>Things I have built</h2>
          <div class="filter" role="group" aria-label="Filter projects by area" data-reveal>
            <p class="small">Show projects in</p>
            <div class="chips">
              <button type="button" class="chip" aria-pressed="true" data-tool="">Anything</button>${tools.map((t) => `<button type="button" class="chip" aria-pressed="false" data-tool="${esc(t)}">${esc(t)}</button>`).join("")}
            </div>
            <p class="small filter-count" aria-live="polite">All ${d.projects.length} projects</p>
          </div>
          <ol class="ledger-rows" data-reveal>${projectRows}
          </ol>
        </div>
        <div class="preview" aria-hidden="true">${video(d.projects[0], "preview-video")}</div>
      </div>
    </section>

    <section class="career field-red" id="work" aria-labelledby="work-head">
      <div class="two-col">
        <h2 id="work-head" class="lead-head" data-reveal>Where I have worked</h2>
        <ul class="groups" data-reveal>${jobRows}
          <li class="group">
            <p class="group-label">Education</p>
            <ul class="rows">${eduRows}
            </ul>
          </li>
          <li class="group">
            <p class="group-label">Certified</p>
            <ul class="rows">${certRows}
            </ul>
          </li>
          <li class="group">
            <p class="group-label">Tools</p>
            <ul class="rows">${skillRows}
            </ul>
          </li>
        </ul>
      </div>
    </section>

    <section class="contact" id="contact" aria-label="Contact">
      <ul class="contact-rows">${contactRows.map(([href, text], i) => `
        <li class="contact-row" data-reveal style="--d:${i % 3}">${href ? `<a class="link" href="${esc(href)}"${href.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${breakable(text)}</a>` : `<span>${esc(text)}</span>`}</li>`).join("")}
        <li class="contact-row greet" data-reveal><span>Say hello</span><a class="round" href="mailto:${esc(basics.email)}?subject=${encodeURIComponent("Hello from your portfolio")}" aria-label="Email Praveen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2"/></svg></a></li>
      </ul>
    </section>
  </main>

  <footer class="footer field-pink">
    <div class="footer-top">
      <div class="invite">
        <h2 class="head" data-reveal>Get the résumé by email</h2>
        <form id="resumeRequestForm" class="resume-form" novalidate data-reveal style="--d:1">
          <label class="sr-only" for="resumeEmail">Your email address</label>
          <input class="field" id="resumeEmail" type="email" name="email" autocomplete="email" placeholder="you@company.com" required>
          <button class="button button-red" type="submit">Send it</button>
          <p class="form-status small" role="status" aria-live="polite"></p>
        </form>
      </div>
      <ul class="footer-links" data-reveal style="--d:2">
        <li><a class="link" href="mailto:${esc(basics.email)}">Email</a></li>
        <li><a class="link" href="https://${esc(basics.linkedin)}" target="_blank" rel="noopener">LinkedIn</a></li>
        <li><a class="link" href="https://${esc(basics.github)}" target="_blank" rel="noopener">GitHub</a></li>
        <li><a class="link" href="${RESUME}" target="_blank" rel="noopener">Résumé</a></li>
      </ul>
    </div>
    <div class="legal small"><span>© ${new Date().getFullYear()} ${esc(basics.name)}</span><span>Code under the Apache 2.0 licence</span></div>
    <p class="wordmark" aria-hidden="true">${esc(basics.name)}</p>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3.11.0/dist/email.min.js"></script>
  <script src="main.js"></script>
</body>
</html>
`;

writeFileSync(new URL("./index.html", import.meta.url), html);
console.log(`index.html written: ${d.experience.length} jobs, ${d.projects.length} projects, ${d.certifications.length} certifications, areas: ${d.projects.map((p) => areasOf(p.skills).length).join("/")}`);
