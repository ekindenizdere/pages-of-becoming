// The motif: the "?" (in GLYPHS.DISPLAY) with a spiral whose centre is the dot of the question.
// Returns geometry in a 1600 × 900 box: the glyph path, its rings (hook / dot) and the spiral,
// both outward (dot → out) and inward (out → dot).
/* global GLYPHS */
(() => {
  const build = async ({ cx = 640, cy = 450, height = 640, rEnd = 600, turns = 3.4 } = {}) => {
    const font = await GLYPHS.loadFont(GLYPHS.FONTS[GLYPHS.DISPLAY].regular);
    const probe = GLYPHS.layout(font, "?", 0, 0, 1000)[0];
    const size = (1000 * height) / probe.box.h;
    const g0 = GLYPHS.layout(font, "?", 0, 0, size)[0];
    const q = GLYPHS.layout(font, "?", cx - g0.box.cx, cy - g0.box.cy, size)[0];
    const rings = GLYPHS.rings(q.cmds).sort((a, b) => Math.abs(a.area) - Math.abs(b.area));
    const dotRing = rings[0], hookRing = rings[rings.length - 1];
    const C = { x: dotRing.box.cx, y: dotRing.box.cy };
    const r0 = Math.max(dotRing.box.w, dotRing.box.h) / 2;           // the spiral starts on the rim of the dot
    const k = Math.log(rEnd / r0) / (turns * 2 * Math.PI);
    const pts = [];
    for (let a = 0; a <= turns * 2 * Math.PI; a += 0.03) {
      const r = r0 * Math.exp(k * a), phi = -Math.PI / 2 + a;
      pts.push([C.x + r * Math.cos(phi), C.y + r * Math.sin(phi)]);
    }
    const toD = (p) => p.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
    return { font, size, q, dot: dotRing, hook: hookRing, C, r0, spiralOut: toD(pts), spiralIn: toD([...pts].reverse()) };
  };
  window.MOTIF = { build };
})();
