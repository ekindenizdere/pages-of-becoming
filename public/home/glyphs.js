// Glyph outlines for the title, via opentype.js. Everything is in "title units":
// S = 200 is the cap size of "Pages" and "Becoming"; y grows downwards like SVG.
/* global opentype */
(() => {
  const S = 200;

  // The display font whose outlines draw the title, the "?" and the section titles.
  // PP Pangaia is hosted outside this public repo (its licence forbids putting the files here).
  // If it can't be fetched (server down, missing CORS header), Instrument Serif (OFL) stands in.
  const DISPLAY = "pangaia";
  const PANGAIA = "https://elisabetdelgadomas.com/file/ekinweb/font/";
  const FONTS = {
    pangaia: { label: "PP Pangaia Medium", regular: PANGAIA + "PPPangaia-Medium.otf?v=2", italic: PANGAIA + "PPPangaia-MediumItalic.otf?v=2", licence: "Pangram web licence" },
    instrument: { label: "Instrument Serif", regular: "fonts/glyph/instrument-serif.ttf", italic: "fonts/glyph/instrument-serif-italic.ttf", licence: "OFL" },
  };
  const FALLBACK = { [FONTS.pangaia.regular]: FONTS.instrument.regular, [FONTS.pangaia.italic]: FONTS.instrument.italic };

  const cache = new Map();
  const loadFont = async (url) => {
    if (!url) return null;
    if (!cache.has(url)) {
      const get = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(`${r.status} ${u}`); return r.arrayBuffer(); }).then((b) => opentype.parse(b));
      cache.set(url, get(url).catch((err) => { if (!FALLBACK[url]) throw err; console.warn("Display font unavailable, using Instrument Serif:", err.message); return get(FALLBACK[url]); }));
    }
    return cache.get(url);
  };

  const cmdsToD = (cmds, p = 2) => cmds.map((c) => {
    const f = (n) => +n.toFixed(p);
    switch (c.type) {
      case "M": return `M${f(c.x)} ${f(c.y)}`;
      case "L": return `L${f(c.x)} ${f(c.y)}`;
      case "C": return `C${f(c.x1)} ${f(c.y1)} ${f(c.x2)} ${f(c.y2)} ${f(c.x)} ${f(c.y)}`;
      case "Q": return `Q${f(c.x1)} ${f(c.y1)} ${f(c.x)} ${f(c.y)}`;
      default: return "Z";
    }
  }).join("");

  const bboxOf = (cmds) => {
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    cmds.forEach((c) => ["", "1", "2"].forEach((k) => {
      const x = c["x" + k], y = c["y" + k];
      if (x === undefined) return;
      x1 = Math.min(x1, x); y1 = Math.min(y1, y); x2 = Math.max(x2, x); y2 = Math.max(y2, y);
    }));
    return { x1, y1, x2, y2, w: x2 - x1, h: y2 - y1, cx: (x1 + x2) / 2, cy: (y1 + y2) / 2 };
  };

  // Faux italic for fonts without one: shear around the baseline.
  const shear = (cmds, baseline, angle = 12) => {
    const k = Math.tan((angle * Math.PI) / 180);
    return cmds.map((c) => {
      const o = { ...c };
      ["", "1", "2"].forEach((s) => { if (o["x" + s] !== undefined) o["x" + s] -= (o["y" + s] - baseline) * k; });
      return o;
    });
  };

  // Lay out a string: one entry per glyph with its outline and box.
  const layout = (font, text, x, baseline, size, opts = {}) => {
    const glyphs = font.stringToGlyphs(text);
    const scale = size / font.unitsPerEm;
    const out = [];
    let pen = x;
    glyphs.forEach((g, i) => {
      let cmds = g.getPath(pen, baseline, size).commands;
      if (opts.shear) cmds = shear(cmds, baseline);
      out.push({ ch: text[i], x: pen, baseline, size, adv: g.advanceWidth * scale, cmds, d: cmdsToD(cmds), box: bboxOf(cmds) });
      pen += g.advanceWidth * scale;
      if (i < glyphs.length - 1) pen += (font.getKerningValue(g, glyphs[i + 1]) || 0) * scale;
    });
    return out;
  };

  // Split an outline into rings (sub-paths), each with its d, box and signed area.
  const rings = (cmds) => {
    const list = [];
    let cur = null;
    cmds.forEach((c) => {
      if (c.type === "M") { cur = [c]; list.push(cur); } else if (cur) cur.push(c);
    });
    return list.map((r) => {
      let a = 0;
      const pts = r.filter((c) => c.x !== undefined).map((c) => [c.x, c.y]);
      for (let i = 0; i < pts.length; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
        a += x0 * y1 - x1 * y0;
      }
      return { cmds: r, d: cmdsToD(r), box: bboxOf(r), area: a / 2, pts };
    });
  };

  // Outer rings vs counters (holes): a hole sits inside another ring's box.
  const classifyRings = (rs) => rs.map((r, i) => {
    const hole = rs.some((o, j) => j !== i && Math.abs(o.area) > Math.abs(r.area) &&
      r.box.x1 >= o.box.x1 && r.box.x2 <= o.box.x2 && r.box.y1 >= o.box.y1 && r.box.y2 <= o.box.y2);
    return { ...r, hole };
  });

  // The whole title: "Pages" + small raised italic "of" / "Becoming" indented under the "a".
  const title = async (key, opts = {}) => {
    const def = FONTS[key];
    const [reg, ita] = await Promise.all([loadFont(def.regular), loadFont(def.italic)]);
    const capH = (reg.tables.os2.sCapHeight || reg.ascender * 0.7) / reg.unitsPerEm;
    const size = S / capH;                          // font size so that caps are exactly S tall
    const top = S * 0.35;
    const baseline1 = top + S;
    const pages = layout(reg, "Pages", 0, baseline1, size);
    const pagesEnd = pages[pages.length - 1].x + pages[pages.length - 1].adv;
    const ofSize = size * (opts.ofScale || 0.34);
    const ofFont = ita || reg;
    const ofBaseline = baseline1 - S + ofSize * capH * 1.02;
    const of = layout(ofFont, "of", pagesEnd + S * 0.08, ofBaseline, ofSize, { shear: !ita });
    const baseline2 = baseline1 + S * 1.62;
    const indent = pages[1].x;
    const becoming = layout(reg, "Becoming", indent, baseline2, size);
    const q = layout(reg, "?", 0, baseline2, size)[0];
    const bEnd = becoming[becoming.length - 1];
    const width = Math.max(pagesEnd + S * 0.9, bEnd.x + bEnd.adv);
    const bottom = baseline2 + S * 0.62;
    return { key, def, reg, ita, S, size, capH, baseline1, baseline2, indent, pages, of, becoming, q, width, height: bottom, layout: (t, x, y, s) => layout(reg, t, x, y, s) };
  };

  const HANDS = {};

  // A single word (section titles), caps height = S.
  const word = async (key, text) => {
    const def = FONTS[key];
    const reg = await loadFont(def.regular);
    const capH = (reg.tables.os2.sCapHeight || reg.ascender * 0.7) / reg.unitsPerEm;
    const size = S / capH;
    const baseline = S * 1.35;
    const glyphs = layout(reg, text, 0, baseline, size).filter((g) => g.ch !== " ");
    const last = glyphs[glyphs.length - 1];
    return { key, def, reg, S, size, baseline, glyphs, width: last.x + last.adv, height: baseline + S * 0.55, layout: (t, x, y, s) => layout(reg, t, x, y, s) };
  };

  window.GLYPHS = { DISPLAY, HANDS, word, S, FONTS, loadFont, layout, rings, classifyRings, cmdsToD, bboxOf, title };
})();
