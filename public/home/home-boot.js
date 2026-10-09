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
  const quiet = [
    { l: "36%", t: "2%", w: "62%", z: 120, html: quote("Thomas Nagel", "There is no view from nowhere.", "after <i>The View from Nowhere</i>, 1986") },
    { l: "0%", t: "22%", w: "72%", z: 70, html: quote("Francisco J. Varela", "Our current notions about evolution and brain will be as distant to our grandchildren as this animistic cosmology is to us today.", "1987, p. 49", true) },
    { l: "24%", t: "52%", w: "76%", z: 160, html: quote("Howard H. Pattee", "Since we are free to make our own syntactic rules we are also free to interpret inherently simple events as messages in our own elaborate symbolic systems, and indeed this is what has generated all mythologies and probably several sciences.", "1977, p. 262", true) },
  ];
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
