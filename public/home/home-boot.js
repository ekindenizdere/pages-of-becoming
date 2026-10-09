// Boots whichever home components a page contains (data-* hooks).
/* global HOME */
(async () => {
  await document.fonts.ready;
  const heroEl = document.querySelector(".hero");
  if (heroEl) HOME.hero(heroEl, { playOpening: heroEl.dataset.opening !== "off" });
  document.querySelectorAll("[data-list]").forEach((n) => HOME.list(n, HOME.pieces[n.dataset.list], { style: n.dataset.style || "index" }));
  document.querySelectorAll("[data-config]").forEach((n) => HOME.configTitle(n, n.dataset.config));
  document.querySelectorAll("[data-question]").forEach((n) => HOME.questionTitle(n, n.dataset.question));
  // quotes on the planes: author first, citation last
  // quotes on the planes: the text first, then one line of author, work and year
  const quote = (author, text, cite, small) => `<p class="pr${small ? " pr-s" : ""}">${text}</p><small class="cite"><span class="au">${author}</span>${cite ? `, ${cite}` : ""}</small>`;
  const citeOf = (q) => q.cite !== undefined ? q.cite : [q.work, q.year].filter(Boolean).join(", ");
  // The three prototype positions (left, width, depth) repeat down the stage as a rhythm; the quotes come from
  // the commonplace database (src/data/quotes.json) when the page provides it: four per visit, different authors.
  const RHYTHM = [{ l: "36%", w: "62%", z: 120 }, { l: "0%", w: "72%", z: 70 }, { l: "24%", w: "76%", z: 160 }];
  const pool = window.POB_QUOTES || window.POB_I18N.quotes;
  const shuffle = (a) => a.slice().sort(() => Math.random() - 0.5);
  // n quotes, each from a different author while the database allows it, never one that is already on the page
  const pick = (n, keep = []) => {
    const seen = new Set(keep.map((q) => q.author)), used = new Set(keep.map((q) => q.text)), out = [];
    for (const q of shuffle(pool)) { if (used.has(q.text) || seen.has(q.author)) continue; seen.add(q.author); out.push(q); if (out.length === n) break; }
    for (const q of shuffle(pool)) { if (out.length === n) break; if (used.has(q.text) || out.includes(q)) continue; out.push(q); }
    return out;
  };
  const toCards = (list) => list.map((q, i) => { const r = RHYTHM[i % RHYTHM.length]; return { l: r.l, t: `${(2 + i * (100 / list.length) * 0.92).toFixed(1)}%`, w: r.w, z: r.z, html: quote(q.author, q.text, citeOf(q), true) }; });
  let shown = pool === window.POB_I18N.quotes ? pool : pick(4);
  const quiet = toCards(shown);
  document.querySelectorAll("[data-planes]").forEach((n) => HOME.planes(n, n.dataset.planes === "quiet" ? quiet : [
    { l: "4%", t: "8%", w: "34%", z: 50, html: `<small>( 01 ) The question</small><p class="pq">what does it mean to <em>be</em> who we are?</p>` },
    { l: "58%", t: "14%", w: "36%", z: 120, html: `<small>( 02 ) Partial</small><p class="pr">There is no view from nowhere.</p><small style="margin:.6rem 0 0">Thomas Nagel · all viewpoints are partial</small>` },
    { l: "52%", t: "60%", w: "30%", z: 180, html: `<small>Opinion · 6 min</small><p class="pt">On Progress</p><p class="pe">Something is off with the vibe.</p>` },
  ]));
  // commonplace controls: "other quotes" redraws the same number; "+" adds one; both survive each other
  const ctl = document.querySelector("[data-quote-controls]");
  if (ctl && window.POB_QUOTES) {
    const stage = document.querySelector("[data-planes='quiet']");
    const T = window.POB_I18N.commonplace;
    let presses = 0;
    const note = ctl.querySelector("[data-note]");
    const after = () => { presses++; if (presses > 3 && note) { note.textContent = T.enough; note.hidden = false; } };
    ctl.querySelector("[data-refresh]").addEventListener("click", () => { shown = pick(shown.length); stage.planes && stage.planes.render(toCards(shown)); after(); });
    ctl.querySelector("[data-more]").addEventListener("click", () => { shown = shown.concat(pick(1, shown)); stage.planes && stage.planes.render(toCards(shown)); after(); });
  }
  document.querySelectorAll("[data-ink]").forEach((n) => HOME.ink(n));
  HOME.smoothScroll();
  const top = document.querySelector(".site-top");
  const setTop = () => top && top.classList.toggle("scrolled", window.scrollY > (heroEl ? heroEl.offsetHeight - 70 : 10));
  window.addEventListener("scroll", setTop, { passive: true }); setTop();
  // a sticky column taller than the screen: let it scroll first, then stick by its bottom edge
  document.querySelectorAll("[data-sticky]").forEach((n) => {
    const set = () => { n.style.top = `${Math.min(96, window.innerHeight - n.offsetHeight - 24)}px`; };
    set(); new ResizeObserver(set).observe(n); window.addEventListener("resize", set);
  });
})();
