// "Who's visiting": total visits, a 30-day bar chart with hover details, and where people come from.
(() => {
  const root = document.getElementById("visitors");
  if (!root || !window.Backend) return;
  if (!Backend.enabled) return;

  const $ = (sel) => root.querySelector(sel);
  const fmt = new Intl.NumberFormat();
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const dayFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", timeZone: "UTC" });

  const drawDaily = (daily) => {
    const chart = $(".v-chart");
    const max = Math.max(1, ...daily.map((d) => d.visits));
    chart.innerHTML = "";
    daily.forEach((d, i) => {
      const bar = document.createElement("button");
      bar.type = "button";
      bar.className = "v-bar";
      const label = `${dayFmt.format(new Date(d.day))}: ${fmt.format(d.visits)} visit${d.visits === 1 ? "" : "s"}`;
      bar.setAttribute("aria-label", label);
      bar.dataset.label = label;
      bar.style.setProperty("--h", `${(d.visits / max) * 100}%`);
      bar.style.setProperty("--i", i);
      if (!d.visits) bar.classList.add("is-zero");
      chart.appendChild(bar);
    });
    $(".v-axis").innerHTML = `<span>${dayFmt.format(new Date(daily[0].day))}</span><span>today</span>`;
    // Peak value labelled directly; every other value is on hover/focus.
    const peak = daily.reduce((a, b) => (b.visits > a.visits ? b : a), daily[0]);
    $(".v-peak").textContent = peak.visits ? `Busiest day: ${dayFmt.format(new Date(peak.day))}, ${fmt.format(peak.visits)} visits` : "No visits yet in the last 30 days";
  };

  const tip = $(".v-tip");
  const showTip = (bar) => {
    tip.textContent = bar.dataset.label;
    const c = $(".v-chart").getBoundingClientRect(), b = bar.getBoundingClientRect();
    const x = Math.min(Math.max(b.left + b.width / 2 - c.left, 60), c.width - 60);
    tip.style.transform = `translate(${x}px, 0) translateX(-50%)`;
    tip.hidden = false;
    root.querySelectorAll(".v-bar").forEach((el) => el.classList.toggle("is-dim", el !== bar));
  };
  const hideTip = () => { tip.hidden = true; root.querySelectorAll(".v-bar").forEach((el) => el.classList.remove("is-dim")); };
  $(".v-chart").addEventListener("pointerover", (e) => { const b = e.target.closest(".v-bar"); if (b) showTip(b); });
  $(".v-chart").addEventListener("pointerleave", hideTip);
  $(".v-chart").addEventListener("focusin", (e) => { const b = e.target.closest(".v-bar"); if (b) showTip(b); });
  $(".v-chart").addEventListener("focusout", hideTip);

  const drawRanked = (el, rows) => {
    const max = Math.max(1, ...rows.map((r) => r.visits));
    el.innerHTML = rows.length
      ? rows.map((r) => `<li><span class="v-name">${esc(r.name)}</span><span class="v-track"><span class="v-fill" style="--w:${(r.visits / max) * 100}%"></span></span><span class="v-num nums">${fmt.format(r.visits)}</span></li>`).join("")
      : `<li class="muted">Nothing yet</li>`;
  };

  const load = async () => {
    await Backend.visitLogged;
    try {
      const s = await Backend.rpc("visit_stats");
      $(".v-total").textContent = fmt.format(s.total);
      $(".v-unique").textContent = `${fmt.format(s.unique)} unique visitors`;
      drawDaily(s.daily);
      drawRanked($(".v-regions"), s.regions);
      drawRanked($(".v-sources"), s.sources);
      root.hidden = false;
    } catch {
      root.hidden = true;
    }
  };
  // The section stays hidden until real numbers arrive, so a missing backend never shows an empty chart.
  if (document.readyState === "complete") load(); else addEventListener("load", load);
})();
