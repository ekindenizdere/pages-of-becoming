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
  const quote = (author, text, cite, small) => `<small class="au">${author}</small><p class="pr${small ? " pr-s" : ""}">${text}</p><small class="cite">${cite}</small>`;
  // The three prototype positions (left, width, depth) repeat down the stage as a rhythm; the quotes come from
  // the commonplace database (src/data/quotes.json) when the page provides it, six at random per visit.
  const RHYTHM = [{ l: "36%", w: "62%", z: 120 }, { l: "0%", w: "72%", z: 70 }, { l: "24%", w: "76%", z: 160 }];
  const pool = window.POB_QUOTES || window.POB_I18N.quotes;
  const picked = pool === window.POB_I18N.quotes ? pool : pool.slice().sort(() => Math.random() - 0.5).slice(0, 6);
  const step = 100 / picked.length;
  const quiet = picked.map((q, i) => {
    const r = RHYTHM[i % RHYTHM.length];
    return { l: r.l, t: `${(2 + i * step * 0.92).toFixed(1)}%`, w: r.w, z: r.z, html: quote(q.author, q.text, q.cite, true) };
  });
  document.querySelectorAll("[data-planes]").forEach((n) => HOME.planes(n, n.dataset.planes === "quiet" ? quiet : [
    { l: "4%", t: "8%", w: "34%", z: 50, html: `<small>( 01 ) The question</small><p class="pq">what does it mean to <em>be</em> who we are?</p>` },
    { l: "58%", t: "14%", w: "36%", z: 120, html: `<small>( 02 ) Partial</small><p class="pr">There is no view from nowhere.</p><small style="margin:.6rem 0 0">Thomas Nagel · all viewpoints are partial</small>` },
    { l: "52%", t: "60%", w: "30%", z: 180, html: `<small>Opinion · 6 min</small><p class="pt">On Progress</p><p class="pe">Something is off with the vibe.</p>` },
  ]));
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
