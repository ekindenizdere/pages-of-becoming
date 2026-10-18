// "Stories": the heading writes itself. Each letter of the display font is traced as one pen line,
// outline by outline, the way the stories begin in a notebook; a small blue pen tip leads the line,
// and each letter settles into solid ink once it is written. Hovering a letter writes it again.
// Prototype (shown at /lab/home/), built from the same glyph outlines as Eli's other section titles.
/* global GLYPHS, LAB */
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const INK = "#0b0b0c", DEEP = "#0a6f79";
  const SPEED = 1500;     // title units per second along the outline (cap height = 200)
  const GAP = 0.08;       // pause between letters, s
  const SETTLE = 0.45;    // ink fill fading in after a letter is written, s
  const el = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    if (parent) parent.appendChild(e);
    return e;
  };
  const motion = () => (window.LAB ? LAB.motion : !matchMedia("(prefers-reduced-motion: reduce)").matches);
  const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);

  const penTitle = async (stage, text) => {
    const W = await GLYPHS.word(GLYPHS.DISPLAY, text), S = W.S, pad = 30;
    const VW = W.width + pad * 2, VH = W.height;
    // the same cap height as the other section titles ("shared")
    if (stage.dataset.cap === "shared") {
      const set = () => { const cap = Math.min(46, stage.parentElement.clientWidth * 0.1); stage.style.width = `${(VW * cap) / S}px`; stage.style.maxWidth = "100%"; };
      set(); new ResizeObserver(set).observe(stage.parentElement);
    }
    const svg = el("svg", { viewBox: `${-pad} 0 ${VW} ${VH}`, "aria-hidden": "true" }, stage);
    const letters = W.glyphs.map((g) => {
      const grp = el("g", {}, svg);
      const fill = el("path", { d: g.d, fill: INK, opacity: 0 }, grp);
      const strokes = GLYPHS.rings(g.cmds).map((r) => {
        const p = el("path", { d: r.d, fill: "none", stroke: INK, "stroke-width": 2.6, "stroke-linecap": "round", "stroke-linejoin": "round" }, grp);
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len} ${len}`;
        p.style.strokeDashoffset = len;
        return { p, len };
      });
      const hit = el("rect", { x: g.x, y: 0, width: g.adv, height: VH, fill: "transparent" }, grp);
      return { g, fill, strokes, hit, total: strokes.reduce((a, s) => a + s.len, 0), busy: false };
    });
    const tip = el("circle", { r: 5.5, fill: DEEP, opacity: 0 }, svg);

    const solid = () => letters.forEach((L) => { L.fill.setAttribute("opacity", 1); L.strokes.forEach((s) => { s.p.style.strokeDashoffset = 0; }); });
    if (!motion()) { solid(); return; }

    // write one letter: its outlines one after another, then the ink settles
    const write = (L, t0, now) => {
      let t = (now - t0) / 1000, done = true, at = null;
      for (const s of L.strokes) {
        const dur = s.len / SPEED;
        const k = Math.min(1, Math.max(0, t / dur));
        s.p.style.strokeDashoffset = s.len * (1 - k);
        if (k < 1) { done = false; if (k > 0 || !at) at = s.p.getPointAtLength(s.len * k); break; }
        t -= dur;
      }
      const writtenFor = (now - t0) / 1000 - L.total / SPEED;
      L.fill.setAttribute("opacity", done ? ease(Math.min(1, writtenFor / SETTLE)) : 0);
      return { done: done && writtenFor >= SETTLE, at };
    };

    // the whole word, once, when it comes into view
    const play = () => {
      let i = 0, t0 = performance.now();
      tip.setAttribute("opacity", 1);
      const frame = (now) => {
        const L = letters[i];
        const r = write(L, t0, now);
        if (r.at) { tip.setAttribute("cx", r.at.x); tip.setAttribute("cy", r.at.y); }
        // the next letter starts as soon as this one's line is drawn; its ink keeps settling on its own
        if ((now - t0) / 1000 >= L.total / SPEED + GAP) {
          settle(L, t0);
          i += 1; t0 = now;
          if (i >= letters.length) { tip.setAttribute("opacity", 0); return; }
        }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    const settle = (L, t0) => { const f = (now) => { if (!write(L, t0, now).done) requestAnimationFrame(f); }; requestAnimationFrame(f); };

    // hovering a letter writes it again, with its own small pen tip
    letters.forEach((L) => L.hit.addEventListener("pointerenter", () => {
      if (L.busy || !motion()) return;
      L.busy = true;
      L.strokes.forEach((s) => { s.p.style.strokeDashoffset = s.len; });
      const own = el("circle", { r: 4.5, fill: DEEP }, svg);
      const t0 = performance.now();
      const f = (now) => {
        const r = write(L, t0, now);
        if (r.at) { own.setAttribute("cx", r.at.x); own.setAttribute("cy", r.at.y); } else own.setAttribute("opacity", 0);
        if (r.done) { own.remove(); L.busy = false; return; }
        requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    }));

    new IntersectionObserver((entries, io) => { if (entries[0].isIntersecting) { io.disconnect(); setTimeout(play, 250); } }, { threshold: 0.6 }).observe(stage);
  };

  (async () => {
    await document.fonts.ready;
    document.querySelectorAll("[data-pen]").forEach((n) => penTitle(n, n.dataset.pen));
  })();
})();
