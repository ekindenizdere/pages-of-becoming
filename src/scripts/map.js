// Configurations map: pieces, key concepts and people, joined where a piece mentions them.
// Point at (or focus) a word to light up its links; choose it to read them in the panel, with the sentence
// where it appears. Search, filters, zoom (buttons, pinch, ctrl + wheel), drag to move, and a list view.

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const NS = 'http://www.w3.org/2000/svg';

export function initMap() {
  const D = JSON.parse($('#cmap-data').textContent);
  const T = D.text;
  const svg = $('.cmap-svg'), vp = $('.vp', svg), stage = $('.cmap-stage');
  const panelDefault = $('.cmap-default'), panel = $('.cmap-selected'), list = $('.cmap-list');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- graph ----------
  const nodes = [], edges = [], byId = new Map();
  const add = (n) => { nodes.push(n); byId.set(n.id, n); };
  Object.entries(D.pieces).forEach(([slug, p]) => add({ id: `s:${slug}`, type: 'piece', key: slug, label: p.title, href: p.href, kind: p.kind }));
  Object.entries(D.concepts).forEach(([k, c]) => { add({ id: `c:${k}`, type: 'concept', key: k, label: c.label, isKey: c.key, src: c }); c.in.forEach((s) => edges.push([`c:${k}`, `s:${s}`])); });
  Object.entries(D.people).forEach(([k, c]) => { add({ id: `p:${k}`, type: 'person', key: k, label: c.label, src: c }); c.in.forEach((s) => edges.push([`p:${k}`, `s:${s}`])); });
  const E = edges.filter(([a, b]) => byId.has(a) && byId.has(b)).map(([a, b]) => ({ a: byId.get(a), b: byId.get(b) }));
  const neighbours = (n) => new Set([n.id, ...E.filter((e) => e.a === n || e.b === n).map((e) => (e.a === n ? e.b.id : e.a.id))]);
  nodes.forEach((n) => { n.degree = E.filter((e) => e.a === n || e.b === n).length; });

  // layout: the pieces on a wide ring; what belongs to one piece gathers around it (outside the ring);
  // what several pieces share sits inside, between them: the configurations. The same result every time.
  const pieces = nodes.filter((n) => n.type === 'piece');
  const RX = 600, RY = 360;
  pieces.forEach((n, i) => { n.a = (i / pieces.length) * Math.PI * 2 - Math.PI / 2; n.x = Math.cos(n.a) * RX; n.y = Math.sin(n.a) * RY; });
  const linkedPieces = (n) => E.filter((e) => e.a === n).map((e) => e.b);
  for (const p of pieces) {
    const own = nodes.filter((n) => n.type !== 'piece' && linkedPieces(n).length === 1 && linkedPieces(n)[0] === p)
      .sort((a, b) => (a.type === b.type ? a.label.localeCompare(b.label) : a.type === 'concept' ? -1 : 1));
    const perRing = 9;
    own.forEach((n, k) => {
      const ring = Math.floor(k / perRing), inRing = Math.min(perRing, own.length - ring * perRing), j = k % perRing;
      const spread = Math.min(0.34, 2.6 / inRing), ang = p.a + (j - (inRing - 1) / 2) * spread;
      const r = 70 + ring * 46;
      n.x = p.x + Math.cos(ang) * r * 1.6; n.y = p.y + Math.sin(ang) * r;
      n.leaf = true;
    });
  }
  // shared ones on two inner rings: the most shared (4+ pieces) innermost; each leans towards its pieces
  const shared = nodes.filter((n) => n.type !== 'piece' && !n.leaf).map((n) => {
    const ps = linkedPieces(n);
    const cx = ps.reduce((s, p) => s + p.x, 0) / ps.length, cy = ps.reduce((s, p) => s + p.y, 0) / ps.length;
    return { n, count: ps.length, ang: Math.atan2(cy / RY, cx / RX) };
  });
  const ring = (list, rx, ry) => {
    list.sort((a, b) => a.ang - b.ang);
    const start = list.length ? list[0].ang : 0;
    list.forEach((s, k) => { const a = start + (k / list.length) * Math.PI * 2; s.n.x = Math.cos(a) * rx; s.n.y = Math.sin(a) * ry; });
  };
  ring(shared.filter((s) => s.count >= 4), 190, 105);
  ring(shared.filter((s) => s.count < 4), 360, 205);

  // ---------- drawing ----------
  const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); parent?.appendChild(e); return e; };
  const gEdges = el('g', { class: 'edges' }, vp), gNodes = el('g', { class: 'nodes' }, vp);
  E.forEach((e) => { e.el = el('line', { class: 'edge' }, gEdges); });
  nodes.forEach((n) => {
    n.el = el('g', { class: `node ${n.type}${n.isKey ? ' key' : ''}`, tabindex: '0', role: 'button', 'aria-label': n.label, 'data-id': n.id }, gNodes);
    n.bg = el('rect', { class: 'bg' }, n.el);
    n.tx = el('text', { 'text-anchor': 'middle' }, n.el);
    n.tx.textContent = n.label.length > 34 ? `${n.label.slice(0, 33)}…` : n.label;
    if (n.type === 'person' && n.degree > 1) n.el.classList.add('shared');
    if (n.leaf) { n.el.classList.add('leaf'); el('circle', { class: 'dot', r: 3.2, cy: -4 }, n.el); }
  });
  // measure labels, then nudge colliding ones apart (pieces move least), so no label hides another
  nodes.forEach((n) => { const b = n.tx.getBBox(); n.w = b.width + 12; n.h = b.height + 4; n.by = b.y; });
  for (let it = 0; it < 120; it++) {
    let moved = false;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const A = nodes[i], B = nodes[j], dx = B.x - A.x, dy = B.y - A.y;
      const ox = (A.w + B.w) / 2 + 4 - Math.abs(dx), oy = (A.h + B.h) / 2 + 3 - Math.abs(dy);
      if (ox <= 0 || oy <= 0) continue;
      moved = true;
      const wa = A.type === 'piece' ? 0.15 : 1, wb = B.type === 'piece' ? 0.15 : 1, s = (wa + wb) || 1;
      if (oy < ox) { const k = oy / s, sy = dy >= 0 ? 1 : -1; A.y -= sy * k * wa; B.y += sy * k * wb; }
      else { const k = ox / s, sx = dx >= 0 ? 1 : -1; A.x -= sx * k * wa; B.x += sx * k * wb; }
    }
    if (!moved) break;
  }
  nodes.forEach((n) => {
    n.el.setAttribute('transform', `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`);
    n.bg.setAttribute('x', -n.w / 2); n.bg.setAttribute('y', n.by - 2); n.bg.setAttribute('width', n.w); n.bg.setAttribute('height', n.h);
    if (n.type === 'person' || (n.type === 'concept' && !n.isKey)) {
      // half marker, as in the text
      n.half = el('rect', { class: 'half', x: -n.w / 2 + 3, y: n.by - 2 + n.h * 0.5, width: n.w - 6, height: n.h * 0.42 }, n.el);
      n.el.insertBefore(n.half, n.tx);
    }
  });
  E.forEach((e) => { e.el.setAttribute('x1', e.a.x); e.el.setAttribute('y1', e.a.y); e.el.setAttribute('x2', e.b.x); e.el.setAttribute('y2', e.b.y); });

  // ---------- view: pan and zoom ----------
  const bounds = () => {
    const vis = nodes.filter((n) => !n.hidden);
    const xs = vis.flatMap((n) => [n.x - n.w / 2, n.x + n.w / 2]), ys = vis.flatMap((n) => [n.y - n.h, n.y + n.h]);
    return { x: Math.min(...xs) - 30, y: Math.min(...ys) - 30, w: Math.max(...xs) - Math.min(...xs) + 60, h: Math.max(...ys) - Math.min(...ys) + 60 };
  };
  let view = { x: 0, y: 0, k: 1 };
  const apply = (animate) => {
    vp.style.transition = animate && !reduced ? 'transform 600ms cubic-bezier(0.7, 0, 0.2, 1)' : 'none';
    vp.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.k})`;
    svg.classList.toggle('far', view.k < 0.8); // zoomed out: names that belong to one piece show as dots
  };
  const size = () => svg.getBoundingClientRect();
  const fit = (animate = true) => {
    const b = bounds(), s = size();
    const k = Math.min(s.width / b.w, s.height / b.h, 2);
    view = { k, x: (s.width - b.w * k) / 2 - b.x * k, y: (s.height - b.h * k) / 2 - b.y * k };
    apply(animate);
  };
  const zoomAt = (f, cx, cy, animate) => {
    const k = Math.max(0.3, Math.min(4, view.k * f)), r = k / view.k;
    view = { k, x: cx - (cx - view.x) * r, y: cy - (cy - view.y) * r };
    apply(animate);
  };
  // choosing something frames it together with everything it is linked to
  const centreOn = (n) => {
    const nb = [...neighbours(n)].map((id) => byId.get(id)).filter((x) => !x.hidden);
    const xs = nb.flatMap((x) => [x.x - x.w / 2, x.x + x.w / 2]), ys = nb.flatMap((x) => [x.y - x.h, x.y + x.h]);
    const b = { x: Math.min(...xs) - 40, y: Math.min(...ys) - 40, w: Math.max(...xs) - Math.min(...xs) + 80, h: Math.max(...ys) - Math.min(...ys) + 80 };
    const s = size(), k = Math.max(0.35, Math.min(s.width / b.w, s.height / b.h, 1.3));
    view = { k, x: (s.width - b.w * k) / 2 - b.x * k, y: (s.height - b.h * k) / 2 - b.y * k };
    apply(true);
  };
  $$('[data-zoom]').forEach((b) => b.addEventListener('click', () => {
    const s = size();
    if (b.dataset.zoom === 'fit') { select(null); fit(); } else zoomAt(b.dataset.zoom === 'in' ? 1.3 : 1 / 1.3, s.width / 2, s.height / 2, true);
  }));
  // drag to move; two fingers to zoom; ctrl + wheel (or a trackpad pinch) to zoom
  const pts = new Map();
  let drag = null, pinch = null, movedPx = 0;
  svg.addEventListener('pointerdown', (e) => {
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    svg.setPointerCapture(e.pointerId);
    movedPx = 0;
    if (pts.size === 1) drag = { x: e.clientX - view.x, y: e.clientY - view.y };
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: view.k }; drag = null; }
  });
  svg.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return;
    const p = pts.get(e.pointerId);
    movedPx += Math.abs(e.clientX - p.x) + Math.abs(e.clientY - p.y);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pts.size === 2) {
      const [a, b] = [...pts.values()], s = size();
      zoomAt((pinch.k * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.d / view.k, (a.x + b.x) / 2 - s.left, (a.y + b.y) / 2 - s.top, false);
    } else if (drag && movedPx > 4) { view.x = e.clientX - drag.x; view.y = e.clientY - drag.y; apply(false); svg.classList.add('dragging'); }
  });
  const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) { drag = null; svg.classList.remove('dragging'); } };
  svg.addEventListener('pointerup', up);
  svg.addEventListener('pointercancel', up);
  svg.addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) return; // a plain wheel scrolls the page
    e.preventDefault();
    const s = size();
    zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX - s.left, e.clientY - s.top, false);
  }, { passive: false });

  // ---------- highlight, select ----------
  let selected = null, hovered = null;
  const paint = () => {
    const focus = hovered ?? selected;
    const nb = focus ? neighbours(focus) : null;
    nodes.forEach((n) => { n.el.classList.toggle('dim', !!nb && !nb.has(n.id)); n.el.classList.toggle('near', !!nb && nb.has(n.id)); n.el.classList.toggle('focus', n === focus); n.el.classList.toggle('selected', n === selected); });
    E.forEach((e) => { const on = focus && (e.a === focus || e.b === focus); e.el.classList.toggle('on', !!on); e.el.classList.toggle('dim', !!focus && !on); });
  };
  const sentence = (c) => (c ? esc(c.text).replace(esc(c.word), `<mark>${esc(c.word)}</mark>`) : '');
  function select(n, { centre = true, push = true } = {}) {
    selected = n;
    paint();
    $$('.cmap-list button').forEach((b) => b.setAttribute('aria-pressed', String(!!n && b.dataset.id === n.id)));
    if (!n) {
      panel.hidden = true; panelDefault.hidden = false;
      if (push) history.replaceState(null, '', location.pathname);
      return;
    }
    panelDefault.hidden = true; panel.hidden = false;
    if (n.type === 'piece') {
      const linked = E.filter((e) => e.b === n).map((e) => e.a);
      const chips = (type) => linked.filter((x) => x.type === type).sort((a, b) => a.label.localeCompare(b.label))
        .map((x) => `<button type="button" class="chip ${type}${x.isKey ? ' key' : ''}" data-id="${x.id}">${esc(x.label)}</button>`).join('');
      panel.innerHTML = `<p class="cmap-type">${esc(D.kind[n.kind] ?? '')}</p><h2>${esc(n.label)}</h2>
        <a class="cmap-read" href="${n.href}">${esc(T.read)} →</a>
        <h3>${esc(T.concepts)}</h3><div class="chips">${chips('concept')}</div>
        <h3>${esc(T.people)}</h3><div class="chips">${chips('person')}</div>`;
    } else {
      const src = n.src;
      panel.innerHTML = `<p class="cmap-type">${esc(n.type === 'person' ? T.typePerson : n.isKey ? T.typeKey : T.typeConcept)}</p><h2>${esc(n.label)}</h2>
        <p class="cmap-count">${esc(T.appearsIn[src.in.length - 1] ?? '')}</p>
        <ul class="ctx">${src.in.filter((s) => D.pieces[s]).map((s) => `<li><a class="ctx-t" href="${D.pieces[s].href}">${esc(D.pieces[s].title)}</a><span class="ctx-s">${sentence(src.ctx[s])}</span></li>`).join('')}</ul>`;
    }
    if (push) history.replaceState(null, '', `#${{ piece: 's', concept: 'c', person: 'p' }[n.type]}=${encodeURIComponent(n.key)}`);
    if (centre && list.hidden) centreOn(n);
  }
  gNodes.addEventListener('pointerover', (e) => { const g = e.target.closest('.node'); if (g) { hovered = byId.get(g.dataset.id); paint(); } });
  gNodes.addEventListener('pointerout', (e) => { if (e.target.closest('.node')) { hovered = null; paint(); } });
  gNodes.addEventListener('focusin', (e) => { const g = e.target.closest('.node'); if (g) { hovered = byId.get(g.dataset.id); paint(); } });
  gNodes.addEventListener('focusout', () => { hovered = null; paint(); });
  svg.addEventListener('click', (e) => {
    if (movedPx > 6) return; // that was a drag
    const g = e.target.closest('.node');
    if (!g) { select(null); return; }
    const n = byId.get(g.dataset.id);
    if (n === selected && n.type === 'piece') { location.href = n.href; return; }
    select(n);
  });
  svg.addEventListener('keydown', (e) => {
    const g = e.target.closest?.('.node');
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(byId.get(g.dataset.id)); }
    if (e.key === 'Escape') select(null);
  });
  panel.addEventListener('click', (e) => { const b = e.target.closest('[data-id]'); if (b) select(byId.get(b.dataset.id)); });

  // ---------- filters ----------
  const hiddenTypes = new Set();
  const applyFilters = () => {
    nodes.forEach((n) => { n.hidden = hiddenTypes.has(n.type); n.el.style.display = n.hidden ? 'none' : ''; });
    E.forEach((e) => { e.el.style.display = e.a.hidden || e.b.hidden ? 'none' : ''; });
    renderList();
  };
  $$('[data-filter]').forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(on));
    if (on) hiddenTypes.delete(b.dataset.filter); else hiddenTypes.add(b.dataset.filter);
    applyFilters();
    fit();
  }));

  // ---------- list view (phones, screen readers, or simply to browse) ----------
  function renderList() {
    const col = (type, title) => {
      if (hiddenTypes.has(type)) return '';
      const items = nodes.filter((n) => n.type === type).sort((a, b) => (b.degree - a.degree) || a.label.localeCompare(b.label));
      return `<section><h2>${esc(title)}</h2><ul>${items.map((n) => `<li><button type="button" class="chip ${type}${n.isKey ? ' key' : ''}" data-id="${n.id}" aria-pressed="${n === selected}">${esc(n.label)}</button>${n.type !== 'piece' ? `<span class="n">${n.degree}</span>` : ''}</li>`).join('')}</ul></section>`;
    };
    list.innerHTML = col('piece', T.pieces) + col('concept', T.concepts) + col('person', T.people);
  }
  list.addEventListener('click', (e) => { const b = e.target.closest('[data-id]'); if (b) select(byId.get(b.dataset.id), { centre: false }); });
  const setView = (v) => {
    $$('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
    list.hidden = v !== 'list';
    stage.classList.toggle('as-list', v === 'list');
    if (v === 'graph') fit(false);
  };
  $$('[data-view]').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));

  // ---------- search ----------
  const input = $('.cmap-search input'), names = $('#cmap-names');
  names.innerHTML = nodes.map((n) => `<option value="${esc(n.label)}"></option>`).join('');
  const find = (q) => {
    q = q.trim().toLowerCase();
    if (!q) return null;
    return nodes.find((n) => n.label.toLowerCase() === q) ?? nodes.find((n) => n.label.toLowerCase().startsWith(q)) ?? nodes.find((n) => n.label.toLowerCase().includes(q));
  };
  input.addEventListener('change', () => { const n = find(input.value); if (n) { if (n.hidden) { hiddenTypes.delete(n.type); $(`[data-filter="${n.type}"]`).setAttribute('aria-pressed', 'true'); applyFilters(); } select(n); } });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); input.dispatchEvent(new Event('change')); } });

  // ---------- back to the piece the reader came from ----------
  try {
    const ref = new URL(document.referrer);
    if (ref.origin === location.origin && ref.pathname.includes('/pieces/')) { const b = $('.cmap-back'); b.href = ref.href; b.hidden = false; }
  } catch { /* no referrer */ }

  // ---------- start ----------
  renderList();
  const narrowScreen = window.matchMedia('(max-width: 640px)').matches;
  setView(narrowScreen ? 'list' : 'graph');
  const fromHash = () => {
    const m = location.hash.match(/^#([scp])=(.+)$/);
    const n = m && byId.get(`${m[1]}:${decodeURIComponent(m[2])}`);
    if (n) select(n, { push: false });
  };
  requestAnimationFrame(() => { fit(false); fromHash(); });
  window.addEventListener('hashchange', fromHash);
  new ResizeObserver(() => { if (!selected) fit(false); }).observe(svg);
}
