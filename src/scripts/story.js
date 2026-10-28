// Stories: the journey beside the text and the place cards (approved from the preview, 2026-10-18).
// Places are marked while the site is built (src/plugins/rehype-piece.mjs): every mention is clickable.
// The margin that holds notes in the essays holds the journey: a line map of the coast with the road,
// dates, and a small car that follows the reading. It dances a little (the chapter's "dancing car"),
// more under the pointer. The map follows the car along the leg being read; at the chapter's last stop
// it zooms out to the road ahead. Where the margin folds away (phones), the journey sits under the title.
// Drawings (figures in the story's data) take the place of the list of stops while their passage is read;
// on phones they sit under their first paragraph. A click opens them larger.
export function initStory() {
  const node = document.getElementById('story-client');
  if (!node) return;
  const { places, geo: G, chapter, t: T, figures = [] } = JSON.parse(node.textContent);
  const prose = document.querySelector('.prose'), reader = document.querySelector('.reader'), head = document.querySelector('.title-block');
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // the stops in this chapter: reached before it, reached in it (at a paragraph), or still ahead
  const stops = places.filter((p) => p.stop).map((p) => ({ ...p, ahead: !p.arrive || p.arrive.chapter > chapter, here: p.arrive && p.arrive.chapter === chapter }));
  const travelled = stops.filter((p) => !p.ahead);
  const keys = stops.map((p) => p.key);
  const byKey = Object.fromEntries(places.map((p) => [p.key, p]));

  // the road: legs between consecutive stops, measured so the car can sit anywhere along them
  const legs = keys.slice(0, -1).map((k, i) => {
    const pts = G.legs[`${k}-${keys[i + 1]}`], acc = [0];
    for (let j = 1; j < pts.length; j++) acc.push(acc[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]));
    return { pts, acc, len: acc[acc.length - 1], ahead: stops[i + 1].ahead };
  });
  const along = (leg, f) => {
    const d = f * leg.len; let j = 1;
    while (j < leg.pts.length - 1 && leg.acc[j] < d) j++;
    const a = leg.pts[j - 1], b = leg.pts[j], seg = leg.acc[j] - leg.acc[j - 1] || 1, u = Math.max(0, Math.min(1, (d - leg.acc[j - 1]) / seg));
    return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u, ang: Math.atan2(b[1] - a[1], b[0] - a[0]), j };
  };
  const xyOf = (k) => G.stops[k] || G.refs[k];

  // one journey view (map, caption, stops with dates); wide screens get it in the margin, phones under the title
  const journeys = [];
  const makeJourney = (host, withList) => {
    const box = document.createElement('section'); box.className = 'journey'; box.setAttribute('aria-label', T.journey);
    box.innerHTML = `<p class="j-h">${esc(T.journey)}</p>`;
    const svg = mk('svg', { class: 'j-map', viewBox: `0 0 ${G.w} ${G.h}`, role: 'img', 'aria-label': stops.map((p) => p.name).join(', ') }, box);
    mk('path', { d: G.land, class: 'j-coast', 'vector-effect': 'non-scaling-stroke' }, svg);
    legs.forEach((l) => mk('polyline', { points: l.pts.join(' '), class: 'j-road' + (l.ahead ? ' ahead' : ''), 'vector-effect': 'non-scaling-stroke' }, svg));
    const done = mk('polyline', { points: '', class: 'j-done', 'vector-effect': 'non-scaling-stroke' }, svg);
    const dots = places.filter((p) => xyOf(p.key)).map((p) => {
      const s = stops.find((q) => q.key === p.key);
      const g = mk('g', { class: 'j-stop' + (!p.stop ? ' ref' : s.ahead ? ' ahead' : ''), 'data-place': p.key, tabindex: -1 }, svg), xy = xyOf(p.key);
      mk('circle', { cx: xy[0], cy: xy[1], r: 3 }, g);
      mk('text', { x: xy[0], y: xy[1] }, g).textContent = p.name;
      return { g, xy, ref: !p.stop };
    });
    // drawings beside some stops: the farmhouse at Altura (Masia de San Juan, after the photos), left of its dot
    // so the arriving car can stand beside it: the tall square tower, the walls with battlements, two slim
    // round towers in pointed caps and the arched wooden door between them
    const icons = places.filter((p) => p.icon === 'masia' && xyOf(p.key)).map((p) => {
      const s = stops.find((q) => q.key === p.key);
      const g = mk('g', { class: 'j-stop j-masia' + (s && s.ahead ? ' ahead' : ''), 'data-place': p.key }, svg), art = mk('g', {}, g);
      mk('path', { class: 'm-wall', d: 'M-21 0V-11H-20V-12.6H-18.6V-11H-16.4V-12.6H-15V-11H-12.6V-12.6H-11.2V-11H-8.6V-12.6H-7.2V-11H-6V0Z' }, art);
      mk('path', { class: 'm-wall', d: 'M-27 0V-17H-26V-19H-24.4V-17H-23.6V-19H-22V-17H-21V0Z' }, art);
      mk('ellipse', { class: 'm-dark', cx: -24, cy: -14.2, rx: 0.9, ry: 0.9 }, art);
      mk('path', { class: 'm-dark', d: 'M-15.4 0V-4.2Q-13.5 -6.6 -11.6 -4.2V0Z' }, art);
      [-17.2, -9.8].forEach((x) => {
        mk('rect', { class: 'm-tower', x: x - 1, y: -12.4, width: 2, height: 12.4 }, art);
        mk('path', { class: 'm-cap', d: `M${x - 1.3} -12.4L${x} -16.2L${x + 1.3} -12.4Z` }, art);
      });
      mk('path', { class: 'm-dark', d: 'M-25.2 -6.5h1.4v2h-1.4zM-19.5 -7.5h1v1.6h-1zM-8.2 -7.5h1v1.6h-1z' }, art);
      return { g, xy: xyOf(p.key) };
    });
    // the car: a small side view in ink
    const car = mk('g', { class: 'j-car' }, svg), body = mk('g', {}, car);
    mk('path', { d: 'M-11 1 L-11 -3 Q-10 -5 -7 -5 L-4 -9 Q-3 -10 -1 -10 L4 -10 Q6 -10 7 -8 L9 -5 Q11 -5 11 -3 L11 1 Z', class: 'j-body' }, body);
    mk('path', { d: 'M-3 -8.6 L-1 -8.6 L-1 -5.4 L-5 -5.4 Z M1 -8.6 L4 -8.6 Q5 -8.6 5.6 -7.6 L7 -5.4 L1 -5.4 Z', class: 'j-win' }, body);
    mk('circle', { cx: -6, cy: 1.5, r: 2.6, class: 'j-wheel' }, body);
    mk('circle', { cx: 6, cy: 1.5, r: 2.6, class: 'j-wheel' }, body);
    const cap = document.createElement('p'); cap.className = 'j-cap'; box.appendChild(cap);
    let list = null;
    if (withList) {
      list = document.createElement('ol'); list.className = 'j-list';
      list.innerHTML = stops.map((p) => `<li data-place="${p.key}"${p.ahead ? ' class="ahead"' : ''}><button type="button" class="n" aria-haspopup="dialog">${esc(p.name)}</button><span class="d">${esc(p.date)}${p.ahead ? ', ' + esc(T.ahead) : ''}</span></li>`).join('');
      box.appendChild(list);
    }
    const note = document.createElement('p'); note.className = 'j-note'; note.textContent = T.approx; box.appendChild(note);
    host.appendChild(box);
    const J = { box, svg, done, dots, icons, car, body, cap, list, vb: null, hover: 0 };
    car.addEventListener('pointerenter', () => { J.hover = 1; });
    car.addEventListener('pointerleave', () => { J.hover = 0; });
    journeys.push(J);
  };
  const col = document.createElement('div'); col.className = 'journey-col'; reader.appendChild(col);
  makeJourney(col, true);
  const under = document.createElement('div'); under.className = 'journey-under'; head.appendChild(under);
  makeJourney(under, false);

  // where the reader is: between the paragraphs where the car reaches each stop
  const paras = [...prose.querySelectorAll(':scope > p')];
  const anchorOf = (p) => {
    if (!p.here) return null;
    for (let i = p.arrive.para; i < paras.length; i++) { const m = paras[i].querySelector(`.place[data-place="${p.key}"]`); if (m) return m; }
    return paras[p.arrive.para] || null;
  };
  // drawings: one beside the journey (wide screens), one under its first paragraph (phones); the art is the
  // same SVG file, set into the page so it takes the site's fonts and colours
  const figs = figures.filter((f) => paras[f.from]).map((f) => {
    const make = (cls) => {
      const fig = document.createElement('figure'); fig.className = cls;
      fig.innerHTML = `<div class="fig-l" aria-hidden="true"><span>${esc(T.before)}</span><span>${esc(T.after)}</span></div><div class="fig-art" role="img" aria-label="${esc(f.alt)}"></div>`;
      return fig;
    };
    const side = make('j-fig'); side.tabIndex = 0; side.setAttribute('role', 'button'); side.setAttribute('aria-label', `${T.enlarge}: ${f.alt}`);
    const box = journeys[0].box; box.insertBefore(side, journeys[0].list);
    const inline = make('fig-inline'); paras[f.from].after(inline);
    fetch(f.src).then((r) => (r.ok ? r.text() : Promise.reject())).then((svgText) => {
      [side, inline].forEach((fig) => { fig.querySelector('.fig-art').innerHTML = svgText; });
    }).catch(() => {
      [side, inline].forEach((fig) => { fig.querySelector('.fig-art').innerHTML = `<img src="${esc(f.src)}" alt="">`; });
    });
    return { ...f, side };
  });
  let figOn = null;
  const measureFig = () => {
    const y = innerHeight * 0.45;
    const on = figs.find((f) => paras[f.from].getBoundingClientRect().top <= y && paras[f.to].getBoundingClientRect().bottom >= y) || null;
    if (on === figOn) return;
    figOn = on;
    journeys[0].box.classList.toggle('fig-on', !!on);
    figs.forEach((f) => f.side.classList.toggle('is-on', f === on));
  };
  let state = { leg: 0, f: 0, at: travelled[0]?.key, end: false };
  const measure = () => {
    measureFig();
    const y = innerHeight * 0.45;
    const tops = travelled.map((p) => { const a = anchorOf(p); return a ? a.getBoundingClientRect().top : -Infinity; });
    let i = -1; tops.forEach((t, k) => { if (t <= y) i = k; });
    if (i < 0) { state = { leg: 0, f: 0, at: travelled[0].key, end: false }; return; }
    if (i >= travelled.length - 1) { state = { leg: travelled.length - 1, f: 0, at: travelled[i].key, end: true }; return; }
    // a stop reached in an earlier chapter: the leg out of it starts where this chapter's text starts
    const t0 = Number.isFinite(tops[i]) ? tops[i] : Math.min(prose.getBoundingClientRect().top, tops[i + 1]);
    const f = Math.max(0, Math.min(1, (y - t0) / (tops[i + 1] - t0 || 1)));
    state = { leg: i, f, at: f > 0.5 ? travelled[i + 1].key : travelled[i].key, end: false };
  };

  // drawing: the car, the road behind it, the frame of the map, the caption and the list
  const lerp = (a, b, k) => a + (b - a) * k;
  const bounds = (pts, padK, minW, aspect) => {
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    pts.forEach((p) => { x1 = Math.min(x1, p[0]); y1 = Math.min(y1, p[1]); x2 = Math.max(x2, p[0]); y2 = Math.max(y2, p[1]); });
    let w = Math.max(minW, (x2 - x1) * (1 + padK)); const h = Math.max((y2 - y1) * (1 + padK), w / aspect);
    w = Math.max(w, h * aspect);
    return [(x1 + x2) / 2 - w / 2, (y1 + y2) / 2 - h / 2, w, h];
  };
  const allPts = [].concat(...legs.map((l) => l.pts));
  const jump = { x: 0, y: 0, next: 0 };
  let lit = null;
  const frame = (now) => {
    const t = now / 1000;
    const li = Math.min(state.leg, legs.length - 1), leg = legs[li];
    const pos = state.end ? { x: G.stops[state.at][0], y: G.stops[state.at][1], ang: Math.PI, j: 0 } : along(leg, state.f);
    let trail = [];
    for (let i = 0; i < state.leg && i < legs.length; i++) trail = trail.concat(legs[i].pts);
    if (!state.end) trail = trail.concat(leg.pts.slice(0, pos.j), [[pos.x, pos.y]]);
    // the GPS hiccups now and then: a small jump that settles back
    if (!still && t > jump.next) { jump.x = (Math.random() - 0.5) * 2; jump.y = (Math.random() - 0.5) * 2; jump.next = t + 0.5 + Math.random() * 1.2; }
    jump.x *= 0.92; jump.y *= 0.92;
    const from = keys[li], to = keys[li + 1];
    journeys.forEach((J) => {
      const r = J.svg.getBoundingClientRect(); if (!r.width) return;
      const aspect = r.width / r.height;
      // the frame: the car in the middle of the leg being read, or the whole road at the chapter's last stop
      const target = state.end ? bounds(allPts, 0.3, 60, aspect)
        : (() => { const w = Math.max(36, leg.len * 1.15), h = w / aspect; return [pos.x - w / 2, pos.y - h / 2, w, h]; })();
      J.vb = J.vb && !still ? J.vb.map((v, k) => lerp(v, target[k], 0.06)) : target;
      J.svg.setAttribute('viewBox', J.vb.map((v) => v.toFixed(2)).join(' '));
      const k = J.vb[2] / r.width;                       // map units per screen pixel
      J.done.setAttribute('points', trail.join(' '));
      J.dots.forEach((d) => {
        const key = d.g.dataset.place;
        d.g.querySelector('circle').setAttribute('r', (d.ref ? 2.2 : 3) * k);
        const tx = d.g.querySelector('text');
        tx.setAttribute('font-size', 11 * k); tx.setAttribute('x', d.xy[0] + 6 * k); tx.setAttribute('y', d.xy[1] + 15 * k);   // below the dot: the car rides above it
        d.g.classList.toggle('is-here', key === state.at);
        d.g.classList.toggle('is-lit', key === lit);
        // names only where they help: the ends of the leg being read; at the end, the last stop and the one ahead
        d.g.classList.toggle('named', !d.ref && (state.end ? key === state.at || stops.find((s) => s.key === key)?.ahead : key === from || key === to));
      });
      J.icons.forEach((ic) => { ic.g.setAttribute('transform', `translate(${ic.xy[0] - 6 * k} ${ic.xy[1]}) scale(${k * 1.25})`); ic.g.classList.toggle('is-here', ic.g.dataset.place === state.at); });
      const amp = still ? 0 : 1 + J.hover * 2.5;
      const sway = Math.sin(t * 7) * 4 * amp, hop = Math.abs(Math.sin(t * 5)) * -1.2 * amp;
      const face = Math.cos(pos.ang) < 0 ? -1 : 1;
      J.car.setAttribute('transform', `translate(${pos.x + jump.x * k * amp} ${pos.y + jump.y * k * amp}) scale(${k * 1.05})`);
      J.body.setAttribute('transform', `translate(0 ${hop - 4}) rotate(${sway}) scale(${face} 1)`);
      const p = byKey[state.at], text = `${p.name} · ${p.date}`;
      if (J.cap.textContent !== text) J.cap.textContent = text;
      if (J.list) J.list.querySelectorAll('li').forEach((l) => { l.classList.toggle('is-here', l.dataset.place === state.at); l.classList.toggle('is-lit', l.dataset.place === lit); });
    });
    requestAnimationFrame(frame);
  };
  document.addEventListener('scroll', measure, { passive: true, capture: true });
  addEventListener('resize', measure); addEventListener('load', measure); document.fonts.ready.then(measure);
  measure(); requestAnimationFrame(frame);

  // the place card: from any mention in the text, a stop in the list or a dot on the map
  const pop = document.createElement('div'); pop.className = 'pop is-side place-pop'; pop.setAttribute('role', 'dialog'); pop.hidden = true; document.body.appendChild(pop);
  let from = null;
  const open = (key, at) => {
    const p = byKey[key], s = stops.find((q) => q.key === key), i = travelled.findIndex((q) => q.key === key);
    const line = !s ? '' : s.ahead ? T.end : T.stop.replace('{i}', i + 1).replace('{n}', travelled.length);
    pop.setAttribute('aria-label', p.name);
    pop.innerHTML = `<button class="pop-x" type="button" aria-label="${esc(T.close)}">×</button><div class="pop-body"><p class="pl-name">${esc(p.name)}</p><p class="pl-where">${esc(p.where)}</p>${s ? `<p class="pl-stop">${esc(line)} · ${esc(p.date)}</p>` : ''}</div>`;
    const r = at.getBoundingClientRect(), phone = innerWidth <= 700;
    // phones: a sheet from the bottom, as the essays' cards do; wider screens: beside the word
    pop.className = `pop place-pop ${phone ? 'is-sheet' : 'is-side'}`;
    pop.hidden = false;
    if (phone) { pop.style.left = ''; pop.style.top = ''; }
    else {
      pop.style.left = `${Math.max(16, Math.min(r.left + scrollX, scrollX + document.documentElement.clientWidth - pop.offsetWidth - 16))}px`;
      pop.style.top = `${r.bottom + scrollY + 10}px`;
    }
    from = at; lit = key;
    pop.querySelector('.pop-x').onclick = close;
  };
  const close = () => { if (pop.hidden) return; pop.hidden = true; lit = null; if (from && from.focus) from.focus(); };
  const openFig = (fig) => {
    pop.setAttribute('aria-label', fig.querySelector('.fig-art').getAttribute('aria-label'));
    pop.innerHTML = `<button class="pop-x" type="button" aria-label="${esc(T.close)}">×</button><figure class="fig-big">${fig.innerHTML}</figure>`;
    const phone = innerWidth <= 700;
    pop.className = `pop place-pop fig-pop ${phone ? 'is-sheet' : 'is-side'}`;
    pop.hidden = false;
    if (phone) { pop.style.left = ''; pop.style.top = ''; }
    else {
      const r = fig.getBoundingClientRect();
      pop.style.left = `${Math.max(scrollX + 16, r.right + scrollX - pop.offsetWidth)}px`;
      pop.style.top = `${Math.max(scrollY + 16, r.top + scrollY - 40)}px`;
    }
    from = fig; lit = null;
    pop.querySelector('.pop-x').onclick = close;
  };
  figs.forEach((f) => {
    f.side.addEventListener('click', (e) => { e.stopPropagation(); if (!pop.hidden && from === f.side) close(); else openFig(f.side); });
    f.side.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFig(f.side); } });
  });
  const trigger = (e) => e.target.closest?.('.prose .place, .j-list .n, .j-stop');
  document.addEventListener('click', (e) => {
    const el = trigger(e); if (!el) return;
    e.preventDefault(); e.stopPropagation();
    const key = el.closest('[data-place]').dataset.place;
    if (!pop.hidden && lit === key) close(); else open(key, el);
  }, true);
  prose.addEventListener('keydown', (e) => { const s = e.target.closest?.('.place'); if (s && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(s.dataset.place, s); } });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  document.addEventListener('pointerdown', (e) => { if (!pop.hidden && !pop.contains(e.target) && !trigger(e) && !e.target.closest?.('.j-fig')) close(); });
  // hovering a place lights it in the list and on the map
  prose.addEventListener('pointerover', (e) => { const s = e.target.closest('.place'); if (s && pop.hidden) lit = s.dataset.place; });
  prose.addEventListener('pointerout', (e) => { const s = e.target.closest('.place'); if (s && pop.hidden) lit = null; });
}
