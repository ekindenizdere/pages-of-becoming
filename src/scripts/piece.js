// The piece page: notes in the margin (or just below their line on narrow screens), the active note pair,
// "Also in" cards for people and concepts (beside the text when there is room), etymology cards, and the
// reading-progress hairline. Without JavaScript the page still works: notes are links to the list at the end.

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function initPiece() {
  const C = JSON.parse($('#piece-client').textContent);
  const reader = $('.reader'), prose = $('.prose', reader), margin = $('.margin', reader), pop = $('#pop');
  if (!reader || !prose) return;
  const canHover = window.matchMedia('(hover: hover)');
  const narrow = () => reader.clientWidth < 860;
  const marginOn = () => !!margin.offsetParent && !narrow();

  // ---------- notes ----------
  const refs = $$('sup a[data-footnote-ref]', prose).map((a) => {
    const n = a.textContent.trim();
    const li = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    a.dataset.n = n;
    if (li) li.dataset.n = n;
    return { a, n, li };
  });
  const noteBody = (li) => {
    const c = li.cloneNode(true);
    $$('[data-footnote-backref]', c).forEach((x) => x.remove());
    $$('[id]', c).forEach((x) => x.removeAttribute('id'));
    $$('[tabindex]', c).forEach((x) => x.removeAttribute('tabindex'));
    return c.innerHTML;
  };
  function setActive(n, on) {
    $$(`[data-n="${n}"]`).forEach((el) => el.classList.toggle('is-active', on));
  }
  function layoutMargin() {
    margin.innerHTML = '';
    // when the notes stand in the margin, the list under the text would only repeat them: it is hidden
    // from view then (screen readers, print and narrow screens still get it)
    reader.classList.toggle('notes-in-margin', marginOn() && refs.some((r) => r.li));
    if (!marginOn()) return;
    const top0 = margin.getBoundingClientRect().top;
    let floor = 0;
    for (const { a, n, li } of refs) {
      if (!li) continue;
      const side = document.createElement('div');
      side.className = 'side';
      side.dataset.n = n;
      side.setAttribute('aria-hidden', 'true'); // the list at the end carries the same notes for screen readers
      side.innerHTML = `<span class="note-num">${esc(n)}</span>${noteBody(li)}`;
      margin.appendChild(side);
      const y = Math.max(a.getBoundingClientRect().top - top0 - 2, floor);
      side.style.top = `${y}px`;
      floor = y + side.offsetHeight + 14;
    }
    margin.style.minHeight = `${floor}px`;
  }
  function unfold(ref) {
    const sup = ref.a.closest('sup');
    const open = $(`.fn-unfold[data-n="${ref.n}"]`, prose);
    if (open) { open.remove(); setActive(ref.n, false); return; }
    const box = document.createElement('span');
    box.className = 'fn-unfold';
    box.dataset.n = ref.n;
    box.setAttribute('role', 'note');
    box.innerHTML = `<button class="x" type="button" aria-label="${esc(C.text.close)}">×</button><span class="note-num">${esc(ref.n)}</span>${noteBody(ref.li)}`;
    sup.after(box);
    setActive(ref.n, true);
  }

  // ---------- cards ----------
  let popFrom = null, timer = 0;
  function openPop(html, from, label, { side = false } = {}) {
    clearTimeout(timer);
    $$('.is-active', reader).forEach((x) => x.classList.remove('is-active'));
    popFrom = from;
    from.classList.add('is-active');
    pop.innerHTML = `<button class="pop-x" type="button" aria-label="${esc(C.text.close)}">×</button><div class="pop-body">${html}</div>`;
    pop.setAttribute('aria-label', label);
    pop.hidden = false;
    pop.style.width = '';
    pop.classList.remove('is-side');
    const sheet = narrow();
    pop.classList.toggle('is-sheet', sheet);
    if (sheet) { pop.style.left = pop.style.top = ''; return; }
    const r = from.getBoundingClientRect(), vw = document.documentElement.clientWidth;
    const m = margin.offsetParent ? margin.getBoundingClientRect() : null;
    const room = m ? vw - m.left - 12 : 0;
    if (side && m && room >= 240) {
      // beside the text, in the margin, level with the word
      pop.classList.add('is-side');
      pop.style.width = `${Math.min(room, 384)}px`;
      pop.style.left = `${m.left + window.scrollX - 8}px`;
      let top = r.top + window.scrollY - 14;
      const over = r.top - 14 + pop.offsetHeight + 16 - window.innerHeight;
      if (over > 0) top -= Math.min(over, Math.max(0, r.top - 80));
      pop.style.top = `${top}px`;
      return;
    }
    // otherwise just below the word (or above it, if there is no room below)
    const w = pop.offsetWidth;
    pop.style.left = `${Math.min(Math.max(16, r.left - 24), vw - w - 16)}px`;
    let top = r.bottom + window.scrollY + 10;
    if (r.bottom + pop.offsetHeight + 20 > window.innerHeight && r.top > pop.offsetHeight + 20) top = r.top + window.scrollY - pop.offsetHeight - 10;
    pop.style.top = `${top}px`;
  }
  function closePop(returnFocus = false) {
    if (pop.hidden) return;
    pop.hidden = true;
    popFrom?.classList.remove('is-active');
    if (returnFocus) popFrom?.focus();
    popFrom = null;
  }

  let dataP = null;
  const data = () => (dataP ??= fetch(C.data).then((r) => r.json()));
  const mapHref = (kind, key) => `${C.map}#${kind === 'person' ? 'p' : 'c'}=${encodeURIComponent(key)}`;
  async function alsoIn(el) {
    const d = await data();
    const kind = el.classList.contains('c-person') ? 'person' : 'concept';
    const src = (kind === 'person' ? d.people : d.concepts)[el.dataset.c];
    if (!src) return null;
    const others = src.in.filter((s) => s !== C.slug && d.pieces[s]);
    const ctx = (c) => (c ? esc(c.text).replace(esc(c.word), `<mark>${esc(c.word)}</mark>`) : '');
    const html = `<p class="map-head">${esc(src.label)}</p>${others.length
      ? `<p class="map-sub">${esc(C.text.alsoIn)}</p><ul class="ctx">${others.map((s) =>
        `<li><a class="ctx-t" href="${C.pieceBase}${s}/">${esc(d.pieces[s].title)}</a><span class="ctx-s">${ctx(src.ctx[s])}</span></li>`).join('')}</ul>`
      : `<p class="map-sub">${esc(C.text.onlyHere)}</p>`}<a class="map-open" href="${mapHref(kind, el.dataset.c)}">${esc(C.text.openMap)} →</a>`;
    return { html, label: src.label, kind };
  }
  async function showAlsoIn(el, focus) {
    const card = await alsoIn(el);
    if (!card) return;
    openPop(card.html, el, card.label, { side: true });
    if (focus) pop.focus();
  }
  function etyCard(el) {
    const c = C.ety[el.dataset.ety];
    if (!c) return '';
    return `<p class="ety-head">${c.head}</p><ul class="ety-lines">${c.lines.map((l) => `<li>${l}</li>`).join('')}</ul>${c.also ? `<p class="also"><a href="${C.pieceBase}${c.also.slug}/">${c.also.text}</a></p>` : ''}`;
  }

  // ---------- events ----------
  document.addEventListener('click', (e) => {
    if (e.target.closest('.pop-x')) { closePop(true); return; }
    const refA = e.target.closest('sup a[data-footnote-ref]');
    if (refA) {
      const ref = refs.find((r) => r.a === refA);
      if (!ref?.li) return;
      e.preventDefault();
      if (marginOn()) { setActive(ref.n, true); setTimeout(() => { if (!refA.matches(':hover')) setActive(ref.n, false); }, 1400); }
      else unfold(ref);
      return;
    }
    const x = e.target.closest('.fn-unfold .x');
    if (x) { const box = x.closest('.fn-unfold'); setActive(box.dataset.n, false); box.remove(); return; }
    const c = e.target.closest('.c.first');
    if (c && reader.contains(c)) {
      // on a phone (or without a mouse) the card opens; with a mouse the card is already open, so a click goes to the map
      if (!canHover.matches || narrow()) { e.preventDefault(); showAlsoIn(c, e.detail === 0); }
      else window.location.href = mapHref(c.classList.contains('c-person') ? 'person' : 'concept', c.dataset.c);
      return;
    }
    const ety = e.target.closest('.ety');
    if (ety) { openPop(etyCard(ety), ety, ety.textContent); if (e.detail === 0) pop.focus(); return; }
    if (!pop.hidden && !pop.contains(e.target)) closePop();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePop(true);
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.c.first')) { e.preventDefault(); showAlsoIn(e.target, true); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.ety')) { e.preventDefault(); openPop(etyCard(e.target), e.target, e.target.textContent); pop.focus(); }
  });
  const over = (e, on) => {
    const n = e.target.closest?.('[data-n]');
    if (n && reader.contains(n) && !n.closest('.fn-unfold')) setActive(n.dataset.n, on);
    if (!canHover.matches) return;
    const w = e.target.closest?.('.c.first, .ety');
    if (!w || !reader.contains(w)) return;
    clearTimeout(timer);
    if (on) timer = setTimeout(() => (w.classList.contains('ety') ? openPop(etyCard(w), w, w.textContent) : showAlsoIn(w)), 200);
    else timer = setTimeout(() => { if (!pop.matches(':hover')) closePop(); }, pop.classList.contains('is-side') ? 650 : 260);
  };
  document.addEventListener('pointerover', (e) => over(e, true));
  document.addEventListener('pointerout', (e) => over(e, false));
  pop.addEventListener('pointerenter', () => clearTimeout(timer));
  pop.addEventListener('pointerleave', () => { if (popFrom && canHover.matches) timer = setTimeout(() => closePop(), 400); });

  // ---------- reading progress ----------
  const bar = $('.progress-top i');
  let ticking = false;
  const progress = () => {
    const r = reader.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (-r.top + window.innerHeight * 0.15) / Math.max(1, r.height - window.innerHeight * 0.6)));
    if (bar) bar.style.transform = `scaleX(${f})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(progress); } }, { passive: true });

  // ---------- layout ----------
  let last = '';
  new ResizeObserver(() => {
    const size = `${prose.offsetWidth}x${prose.offsetHeight}`;
    if (size === last) return;
    last = size;
    layoutMargin();
    progress();
  }).observe(prose);
  document.fonts?.ready.then(() => { last = ''; layoutMargin(); });
}
