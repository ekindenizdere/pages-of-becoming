// Home components, shared by the three home directions. Each approved lab element is one component:
//   HOME.hero        opening (spiral → "?") → header on stone, then the v1 point light on "Becoming"
//   HOME.ink         scroll-inked paragraph (GSAP SplitText + ScrollTrigger)
//   HOME.configTitle "Opinion Pieces": configuration effect
//   HOME.questionTitle "Articles": "?" handoff, first-letter intro
//   HOME.planes      level-2 planes, spiral tied to the dot
//   HOME.pieces      the content
/* global gsap, ScrollTrigger, SplitText, Lenis, GLYPHS, MOTIF, LAB */
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const NS = "http://www.w3.org/2000/svg";
  const INK = "#0b0b0c", PAPER = "#fafaf7", STONE = "#e2e2e0", DEEP = "#0a6f79", BLUE = "#c4f8fc";
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
  const el = (tag, attrs = {}, parent) => {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    if (parent) parent.appendChild(e);
    return e;
  };
  const turn = (() => { // cubic-bezier(0.7, 0, 0.2, 1)
    const x1 = 0.7, y1 = 0, x2 = 0.2, y2 = 1;
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    return (x) => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i++) { const f = ((ax * t + bx) * t + cx) * t - x, d = (3 * ax * t + 2 * bx) * t + cx; if (Math.abs(d) < 1e-6) break; t -= f / d; }
      return ((ay * t + by) * t + cy) * t;
    };
  })();

  // a tiny rAF loop per element, only while visible and motion is on
  const loop = (node, frame) => {
    let raf = 0, visible = false, last = 0, t = 0;
    const tick = (ts) => { const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0.016; last = ts; t += dt; frame(t, dt); raf = requestAnimationFrame(tick); };
    const run = () => { const go = visible && LAB.motion; if (go && !raf) { last = 0; raf = requestAnimationFrame(tick); } if (!go && raf) { cancelAnimationFrame(raf); raf = 0; } if (!LAB.motion) frame(t, 0); };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); }).observe(node);
    LAB.onMotion(run);
  };
  const pointer = (node) => {
    const p = { inside: false, fx: 0.5, fy: 0.5, cx: 0, cy: 0 };
    const set = (e) => { const r = node.getBoundingClientRect(); p.cx = e.clientX; p.cy = e.clientY; p.fx = clamp((e.clientX - r.left) / r.width); p.fy = clamp((e.clientY - r.top) / r.height); };
    node.addEventListener("pointerenter", (e) => { p.inside = true; set(e); });
    node.addEventListener("pointermove", (e) => { p.inside = true; set(e); });
    node.addEventListener("pointerleave", () => { p.inside = false; });
    return p;
  };

  // ─────────────────────────── content ───────────────────────────
  const pieces = window.POB_PIECES || { opinion: [], articles: [] };

  // ─────────────────────────── hero: opening → header ───────────────────────────
  // root contains: .hero-bg, svg (made here), .hero-title (with #…-becoming span), .hero-sub, optional corners
  const hero = async (root, { playOpening = true } = {}) => {
    const portrait = () => root.clientWidth / root.clientHeight < 0.9;
    const isPortrait = portrait();
    const VB = isPortrait ? { w: 900, h: 1500 } : { w: 1600, h: 900 };
    const M = isPortrait ? await MOTIF.build({ cx: 520, cy: 1000, height: 520, rEnd: 470 }) : await MOTIF.build({ cx: 1150, cy: 470, height: 600, rEnd: 560 });
    const svg = el("svg", { viewBox: `0 0 ${VB.w} ${VB.h}`, preserveAspectRatio: "xMidYMid slice", "aria-hidden": "true", class: "hero-art" });
    root.insertBefore(svg, root.querySelector(".hero-title"));
    const fs = M.size, depth = fs * 0.05, e = Math.max(1.2, fs * 0.006), dx = 0.447, dy = 0.894;
    const uid = Math.random().toString(36).slice(2, 7);
    el("defs", {}, svg).innerHTML = `
      <filter id="emb-${uid}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
        <feOffset in="SourceAlpha" dx="${-dx * e}" dy="${-dy * e}" result="hiA"/><feFlood flood-color="#fff" flood-opacity="0.95"/><feComposite in2="hiA" operator="in" result="hi"/>
        <feGaussianBlur in="SourceAlpha" stdDeviation="${e / 2}" result="loB"/><feOffset in="loB" dx="${dx * e}" dy="${dy * e}" result="loA"/><feFlood flood-color="#000" flood-opacity="0.22"/><feComposite in2="loA" operator="in" result="lo"/>
        <feGaussianBlur in="SourceAlpha" stdDeviation="${depth * 0.5}" result="c1B"/><feOffset in="c1B" dx="${dx * depth}" dy="${dy * depth}" result="c1A"/><feFlood flood-color="#000" flood-opacity="0.16"/><feComposite in2="c1A" operator="in" result="c1"/>
        <feGaussianBlur in="SourceAlpha" stdDeviation="${depth * 1.6}" result="c2B"/><feOffset in="c2B" dx="${dx * depth * 2.2}" dy="${dy * depth * 2.2}" result="c2A"/><feFlood flood-color="#000" flood-opacity="0.07"/><feComposite in2="c2A" operator="in" result="c2"/>
        <feMerge><feMergeNode in="c2"/><feMergeNode in="c1"/><feMergeNode in="lo"/><feMergeNode in="hi"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`;
    const G = el("g", {}, svg);
    const hair = { fill: "none", "vector-effect": "non-scaling-stroke", "stroke-linecap": "round" };
    const eng = el("g", { opacity: 0 }, G);
    el("path", { d: M.spiralOut, stroke: "#fff", "stroke-opacity": 0.95, "stroke-width": 1.4, transform: `translate(${dx * 1.6} ${dy * 1.6})`, ...hair }, eng);
    el("path", { d: M.spiralOut, stroke: "#000", "stroke-opacity": 0.28, "stroke-width": 1.2, transform: `translate(${-dx * 0.6} ${-dy * 0.6})`, ...hair }, eng);
    const reliefQ = el("path", { d: M.q.d, fill: STONE, filter: `url(#emb-${uid})`, opacity: 0 }, G);
    const spiral = el("path", { d: M.spiralIn, stroke: INK, "stroke-width": 0.9, pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1, ...hair }, G);
    const dot = el("path", { d: M.dot.d, fill: INK, "transform-origin": `${M.C.x} ${M.C.y}`, transform: "scale(0)" }, G);
    const hookLine = el("path", { d: M.hook.d, stroke: INK, "stroke-width": 1, pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1, ...hair }, G);
    const hookFill = el("path", { d: M.hook.d, fill: INK, opacity: 0 }, G);

    // title: "Pages of" ink, "Becoming" relief (B) … ink (g); v1 point light once the opening has finished
    const holder = root.querySelector(".hero-becoming");
    holder.innerHTML = "Becoming".split("").map((c) => `<span class="ch">${c}</span>`).join("");
    const chars = [...holder.children];
    const p = pointer(root);
    const light = { x: -0.2, y: -0.8 };
    const paint = () => {
      const r = root.getBoundingClientRect(), f = parseFloat(getComputedStyle(holder).fontSize);
      chars.forEach((c, i) => {
        const t = 1 - i / (chars.length - 1);
        const b = c.getBoundingClientRect();
        let lx = (b.left + b.width / 2 - r.left) / r.width - light.x, ly = (b.top + b.height / 2 - r.top) / r.height - light.y;
        const len = Math.hypot(lx, ly) || 1; lx /= len; ly /= len;
        const d = f * 0.05 * t, ee = Math.max(1, f * 0.006);
        c.style.color = `color-mix(in srgb, var(--stone) ${(t * 100).toFixed(1)}%, var(--ink))`;
        c.style.textShadow = t < 0.01 ? "none" : [
          `${(-lx * ee).toFixed(2)}px ${(-ly * ee).toFixed(2)}px 0 rgba(255,255,255,${(0.95 * t).toFixed(3)})`,
          `${(lx * ee).toFixed(2)}px ${(ly * ee).toFixed(2)}px ${ee.toFixed(2)}px rgba(0,0,0,${(0.22 * t).toFixed(3)})`,
          `${(lx * d).toFixed(2)}px ${(ly * d).toFixed(2)}px ${(d * 0.5).toFixed(2)}px rgba(0,0,0,${(0.16 * t).toFixed(3)})`,
          `${(lx * d * 2.2).toFixed(2)}px ${(ly * d * 2.2).toFixed(2)}px ${(d * 1.6).toFixed(2)}px rgba(0,0,0,${(0.07 * t).toFixed(3)})`,
        ].join(", ");
      });
    };
    let lit = false;
    loop(root, () => {
      if (!lit) return;
      const tx = p.inside ? p.fx : -0.2, ty = p.inside ? p.fy : -0.8;
      light.x = LAB.motion ? lerp(light.x, tx, 0.08) : tx; light.y = LAB.motion ? lerp(light.y, ty, 0.08) : ty;
      paint();
    });

    const bg = root.querySelector(".hero-bg"), lines = [...root.querySelectorAll(".hero-title .line")];
    const fades = [...root.querySelectorAll(".hero-sub, .hero-corner")];
    const start = { x: VB.w / 2 - M.C.x, y: VB.h / 2 - M.C.y };
    const pos = { ...start };
    const place = () => G.setAttribute("transform", `translate(${pos.x} ${pos.y})`);
    place(); paint();
    gsap.set(lines, { opacity: 0, y: "0.12em" }); gsap.set(fades, { opacity: 0 }); gsap.set(bg, { opacity: 0 });
    const tl = gsap.timeline({ paused: true, defaults: { ease: turn }, onComplete: () => { lit = true; } })
      .to(spiral, { attr: { "stroke-dashoffset": 0 }, duration: 1.7 }, 0)
      .to(dot, { attr: { transform: "scale(1)" }, duration: 0.5 }, 1.45)
      .to(hookLine, { attr: { "stroke-dashoffset": 0 }, duration: 0.9 }, 1.9)
      .to(hookFill, { opacity: 1, duration: 0.6 }, 2.5)
      .to(hookLine, { opacity: 0, duration: 0.4 }, 2.8)
      .to(pos, { x: 0, y: 0, duration: 1.2, onUpdate: place }, 3.1)
      .to(bg, { opacity: 1, duration: 1.1 }, 3.1)
      .to([hookFill, dot, spiral], { opacity: 0, duration: 1 }, 3.25)
      .to([reliefQ, eng], { opacity: 1, duration: 1 }, 3.25)
      .to(lines, { opacity: 1, y: 0, duration: 1, stagger: 0.18 }, 3.45)
      .to(fades, { opacity: 1, duration: 0.8, stagger: 0.08 }, 4.0);
    root.addEventListener("click", () => { if (tl.progress() < 1) tl.progress(1); });
    // production: once per visit (data-once="on"); in the lab it plays on every load
    const once = root.dataset.once === "on";
    let seen = false;
    try { seen = once && sessionStorage.getItem("pob-opening") === "seen"; } catch { /* ignore */ }
    if (!playOpening || seen || !LAB.motion) tl.progress(1);
    else { tl.play(0); try { sessionStorage.setItem("pob-opening", "seen"); } catch { /* ignore */ } }
    return { replay: () => { lit = false; tl.play(0); }, M };
  };

  // ─────────────────────────── scroll-inked paragraph ───────────────────────────
  const ink = (p, { unit = "words", start = "top 82%", end = "bottom 45%" } = {}) => {
    if (!LAB.motion) return;
    const split = SplitText.create(p, { type: unit, aria: "auto" });
    gsap.fromTo(split[unit], { color: "#c3c3c0" }, { color: INK, ease: "none", stagger: 0.08, duration: 0.3, scrollTrigger: { trigger: p, start, end, scrub: 0.6 } });
    p.querySelectorAll(".hl").forEach((hl) => gsap.fromTo(hl, { "--hl": "0%" }, { "--hl": "100%", ease: "none", scrollTrigger: { trigger: p, start: "bottom 62%", end: "bottom 40%", scrub: 0.6 } }));
  };

  // Section titles with data-cap="shared" get the same cap height, whatever the word length.
  const sizeByCap = (stage, VW, S) => {
    if (stage.dataset.cap !== "shared") return;
    const set = () => { const cap = Math.min(46, stage.parentElement.clientWidth * 0.1); stage.style.width = `${(VW * cap) / S}px`; stage.style.maxWidth = "100%"; };
    set(); new ResizeObserver(set).observe(stage.parentElement);
  };

  // ─────────────────────────── "Opinion Pieces": configuration ───────────────────────────
  const configTitle = async (stage, text) => {
    const Wd = await GLYPHS.word(GLYPHS.DISPLAY, text), S = Wd.S, L = Wd.glyphs, n = L.length, pad = 30;
    const VW = Wd.width + pad * 2, VH = Wd.height;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    sizeByCap(stage, VW, S);
    stage.appendChild(canvas);
    const g2 = canvas.getContext("2d");
    let scale = 1, dpr = 1;
    const fit = () => { dpr = window.devicePixelRatio || 1; const cssW = stage.clientWidth; scale = cssW / VW; canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(VH * scale * dpr); canvas.style.width = "100%"; canvas.style.height = `${VH * scale}px`; };
    fit(); new ResizeObserver(fit).observe(stage);
    const letters = L.map((l, li) => {
      const rings = GLYPHS.rings(l.cmds).map((r) => { const pts = []; r.pts.forEach(([x, y]) => { if (!pts.length || Math.hypot(pts[pts.length - 1].rx - x, pts[pts.length - 1].ry - y) > 9) pts.push({ rx: x, ry: y, x, y, vx: 0, vy: 0, li }); }); return pts; });
      return { l, path: new Path2D(l.d), rings, nodes: rings.flat(), t: 0, cx: l.x + l.adv / 2 };
    });
    const cross = [];
    letters.forEach((lt, i) => { if (!i) return; lt.nodes.forEach((a, k) => { if (k % 3) return; let best = null, bd = S * 0.8; letters[i - 1].nodes.forEach((b) => { const d = Math.hypot(a.rx - b.rx, a.ry - b.ry); if (d < bd) { bd = d; best = b; } }); if (best) cross.push([a, best]); }); });
    const all = letters.flatMap((l) => l.nodes);
    const p = pointer(stage);
    loop(stage, (t) => {
      let u = null;
      if (p.inside) { const r = canvas.getBoundingClientRect(); u = { x: (p.cx - r.left) / scale - pad, y: (p.cy - r.top) / scale }; }
      letters.forEach((lt, i) => {
        const base = 0.5 * Math.pow(i / (n - 1), 1.6);
        const prox = u ? Math.exp(-((u.x - lt.cx) ** 2) / (2 * (S * 0.9) ** 2)) : 0;
        const target = clamp(Math.max(base, prox * 0.95));
        lt.t = LAB.motion ? lerp(lt.t, target, target > lt.t ? 0.08 : 0.03) : base;
      });
      all.forEach((q, idx) => {
        const L0 = letters[q.li].t;
        if (!LAB.motion) { q.x = q.rx; q.y = q.ry; return; }
        let fx = (q.rx + Math.sin(t * 0.7 + idx) * L0 - q.x) * 0.06, fy = (q.ry + Math.cos(t * 0.5 + idx * 1.3) * L0 - q.y) * 0.06;
        if (u) { const dx = u.x - q.x, dy = u.y - q.y, d = Math.hypot(dx, dy), R = S * 1.1; if (d < R && d > 1) { const f = (1 - d / R) ** 2 * 1.8 * L0; fx += (dx / d) * f; fy += (dy / d) * f; } }
        q.vx = (q.vx + fx) * 0.84; q.vy = (q.vy + fy) * 0.84; q.x += q.vx; q.y += q.vy;
      });
      g2.setTransform(1, 0, 0, 1, 0, 0); g2.clearRect(0, 0, canvas.width, canvas.height);
      g2.setTransform(scale * dpr, 0, 0, scale * dpr, pad * scale * dpr, 0);
      const hair = 0.7 / scale, near = (a, b) => u && Math.hypot((a.x + b.x) / 2 - u.x, (a.y + b.y) / 2 - u.y) < S * 0.5;
      letters.forEach((lt) => {
        g2.globalAlpha = 1 - 0.88 * lt.t; g2.fillStyle = INK; g2.fill(lt.path); g2.globalAlpha = 1;
        if (lt.t < 0.03) return;
        lt.rings.forEach((ring) => ring.forEach((a, k) => { const b = ring[(k + 1) % ring.length], hot = near(a, b); g2.strokeStyle = hot ? DEEP : `rgba(11,11,12,${(0.75 * lt.t).toFixed(3)})`; g2.lineWidth = hot ? hair * 2 : hair; g2.beginPath(); g2.moveTo(a.x, a.y); g2.lineTo(b.x, b.y); g2.stroke(); }));
      });
      cross.forEach(([a, b]) => { const tt = Math.min(letters[a.li].t, letters[b.li].t); if (tt < 0.05) return; const hot = near(a, b); g2.strokeStyle = hot ? DEEP : `rgba(10,111,121,${(0.4 * tt).toFixed(3)})`; g2.lineWidth = hot ? hair * 1.8 : hair; g2.beginPath(); g2.moveTo(a.x, a.y); g2.lineTo(b.x, b.y); g2.stroke(); });
      all.forEach((q) => { const tt = letters[q.li].t; if (tt < 0.05) return; const hot = u && Math.hypot(q.x - u.x, q.y - u.y) < S * 0.4; g2.globalAlpha = tt; g2.beginPath(); g2.arc(q.x, q.y, (hot ? 3.4 : 2) / scale, 0, Math.PI * 2); g2.fillStyle = hot ? BLUE : PAPER; g2.fill(); g2.lineWidth = hair; g2.strokeStyle = INK; g2.stroke(); });
      g2.globalAlpha = 1;
    });
  };

  // ─────────────────────────── "Articles": "?" handoff ───────────────────────────
  const questionTitle = async (stage, text) => {
    const Wd = await GLYPHS.word(GLYPHS.DISPLAY, text), L = Wd.glyphs, pad = 30;
    sizeByCap(stage, Wd.width + pad * 2, Wd.S);
    const svg = el("svg", { viewBox: `${-pad} 0 ${Wd.width + pad * 2} ${Wd.height}`, "aria-hidden": "true", width: "100%" }, stage);
    const line = { "vector-effect": "non-scaling-stroke", "stroke-width": 1, fill: "none", stroke: INK, pathLength: 1, "stroke-dasharray": "1 1" };
    const items = L.map((l) => {
      const q0 = GLYPHS.layout(Wd.reg, "?", 0, l.baseline, l.size)[0];
      const qs = l.size * Math.min(1, (l.adv * 1.1) / q0.adv), qw = q0.adv * (qs / l.size);
      const q = GLYPHS.layout(Wd.reg, "?", l.x + (l.adv - qw) / 2, l.baseline, qs)[0];
      const g = el("g", {}, svg);
      return { l, m: -1, hover: 0, fill: el("path", { d: l.d, fill: INK }, g), edge: el("path", { d: l.d, ...line, opacity: 0 }, g), qfill: el("path", { d: q.d, fill: INK, "fill-opacity": 0 }, g), qedge: el("path", { d: q.d, ...line, "stroke-dashoffset": 1, opacity: 0 }, g) };
    });
    const apply = (it, m) => {
      it.fill.setAttribute("fill-opacity", (1 - smooth(0, 0.35, m)).toFixed(3));
      it.edge.setAttribute("opacity", (smooth(0, 0.12, m) * (1 - smooth(0.5, 0.62, m))).toFixed(3));
      it.edge.setAttribute("stroke-dashoffset", smooth(0.25, 0.55, m).toFixed(4));
      it.qedge.setAttribute("opacity", (smooth(0.38, 0.48, m) * (1 - smooth(0.9, 1, m) * 0.6)).toFixed(3));
      it.qedge.setAttribute("stroke-dashoffset", (1 - smooth(0.4, 0.75, m)).toFixed(4));
      it.qfill.setAttribute("fill-opacity", smooth(0.68, 1, m).toFixed(3));
    };
    const bump = (x) => (x <= 0 ? 0 : x < 0.8 ? smooth(0, 0.8, x) : x < 1.6 ? 1 : 1 - smooth(1.6, 2.4, x));
    const p = pointer(stage);
    let introAt = -1;
    loop(stage, (t) => {
      if (introAt < 0 && LAB.motion) introAt = t + 0.4;
      let hit = -1;
      if (p.inside) { const m = svg.getScreenCTM(); if (m) { const u = new DOMPoint(p.cx, p.cy).matrixTransform(m.inverse()); hit = items.findIndex((it) => u.x >= it.l.x && u.x < it.l.x + it.l.adv); } }
      items.forEach((it, i) => {
        const wave = i === 0 && introAt >= 0 && LAB.motion ? bump((t - introAt) / 1.3) : 0;
        it.hover = LAB.motion ? lerp(it.hover, i === hit ? 1 : 0, i === hit ? 0.045 : 0.02) : 0;
        const m = +clamp(Math.max(wave, it.hover)).toFixed(3);
        if (m !== it.m) { it.m = m; apply(it, m); }
      });
    });
  };

  // ─────────────────────────── level-2 planes ───────────────────────────
  const planes = async (stage, cards) => {
    const M = await MOTIF.build();
    const DOT_Z = -200;
    const stack = document.createElement("div"); stack.className = "stack"; stage.appendChild(stack);
    const layer = (z) => { const l = document.createElement("div"); l.className = "layer"; l.style.transform = `translateZ(${z}px)`; stack.appendChild(l); return l; };
    // the "?" and spiral behind the cards; data-back="off" leaves the cards alone on the paper
    const withBack = stage.dataset.back !== "off";
    let back = null;
    if (withBack) {
      back = el("svg", { viewBox: "0 0 1600 900", preserveAspectRatio: "xMidYMid meet", "aria-hidden": "true" }, layer(DOT_Z));
      el("path", { d: M.q.d, fill: INK }, back);
      el("path", { d: M.spiralOut, fill: "none", stroke: INK, "stroke-width": 0.9, "vector-effect": "non-scaling-stroke" }, back);
    }
    const front = layer(0);
    let planesEls = [];
    const render = (list) => {
      cards = list; front.innerHTML = "";
      planesEls = cards.map((c) => { const d = document.createElement("div"); d.className = "plane card-plane"; Object.assign(d.style, { left: c.l, top: c.t, width: c.w, transform: `translateZ(${c.z}px)` }); d.innerHTML = c.html; front.appendChild(d); return d; });
      flow();
    };
    // More cards than the prototype's three: stack them by their real heights (a card's gap below the previous one)
    // and size the stage to fit, so no card covers another at any width.
    const flow = () => {
      if (cards.length <= 3) return;
      const gap = Math.max(14, stage.clientWidth * 0.035);
      let y = 0;
      planesEls.forEach((d) => { d.style.top = `${y}px`; y += d.offsetHeight + gap; });
      stage.style.height = `${y + gap}px`;
    };
    render(cards); new ResizeObserver(flow).observe(stage);
    const pin = () => {
      if (!back) { stage.style.perspectiveOrigin = "50% 50%"; stack.style.transformOrigin = `50% 50% ${DOT_Z}px`; return; }
      const m = back.getScreenCTM(), r = stage.getBoundingClientRect(); if (!m) return; const pt = new DOMPoint(M.C.x, M.C.y).matrixTransform(m); const x = ((pt.x - r.left) / r.width) * 100, y = ((pt.y - r.top) / r.height) * 100; stage.style.perspectiveOrigin = `${x}% ${y}%`; stack.style.transformOrigin = `${x}% ${y}% ${DOT_Z}px`; };
    pin(); new ResizeObserver(() => { const t = stack.style.transform; stack.style.transform = "none"; pin(); stack.style.transform = t; }).observe(stage);
    stage.planes = { render };
    const p = pointer(stage), rot = { x: 0, y: 0 };
    loop(stage, (t) => {
      const ty = p.inside ? (p.fx - 0.5) * 18 : Math.sin(t * 0.25) * 3, tx = p.inside ? -(p.fy - 0.5) * 10 : 0, k = LAB.motion ? 0.04 : 1;
      rot.x = lerp(rot.x, tx, k); rot.y = lerp(rot.y, ty, k);
      stack.style.transform = `rotateX(${rot.x.toFixed(2)}deg) rotateY(${rot.y.toFixed(2)}deg)`;
    });
  };

  // ─────────────────────────── piece lists ───────────────────────────
  const pad2 = (n) => String(n).padStart(2, "0");
  const list = (node, items, { kind, style = "index" } = {}) => {
    let n = 0;
    node.innerHTML = items.map((it) => {
      if (!it.upcoming) n++;
      const num = it.upcoming ? "( — )" : `( ${pad2(n)} )`;
      const T = window.POB_I18N || { min: "min", becoming: "becoming" };
      const meta = it.upcoming ? T.becoming : "";  // reading times dropped (2026-10-09)
      if (style === "contents") {
        return `<a class="toc-row${it.upcoming ? " is-upcoming" : ""}" href="${it.href || "#"}" ${it.upcoming ? 'aria-disabled="true" tabindex="-1"' : ""}>
          <span class="toc-title">${it.title}</span><span class="toc-leader" aria-hidden="true"></span><span class="toc-meta">${meta}</span>
          ${it.first ? `<span class="toc-note">${it.first}</span>` : ""}</a>`;
      }
      return `<a class="row${it.upcoming ? " is-upcoming" : ""}" href="${it.href || "#"}" ${it.upcoming ? 'aria-disabled="true" tabindex="-1"' : ""}>
        <span class="row-num">${num}</span><span class="row-title">${it.title}</span>
        <span class="row-first">${it.first || ""}</span><span class="row-meta">${kind ? `${kind} · ` : ""}${meta}</span></a>`;
    }).join("");
  };

  // ─────────────────────────── smooth scroll ───────────────────────────
  let lenis = null;
  const smoothScroll = () => {
    const set = (on) => { lenis?.destroy(); lenis = null; if (on) { lenis = new Lenis({ autoRaf: true, lerp: 0.09 }); lenis.on("scroll", ScrollTrigger.update); } };
    LAB.onMotion(set);
  };

  window.HOME = { pieces, hero, ink, configTitle, questionTitle, planes, list, smoothScroll, turn };
})();
