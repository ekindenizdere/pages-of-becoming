// Shapes every piece the same way while the site is built (the "piece template", approved 2026-10-09):
// people (grey half marker), shared concepts (blue: full for key concepts, half for the others), editorial
// italics, quotations, citations, etymology words, and one line per voice in notes that quote several authors.
// It also removes anything that could run code, since pieces arrive from an import.
import {
  compile, VOCAB, PEOPLE, personPattern, conceptFlags, conceptStats,
  ITALIC_TERMS, WORD_AS_WORD, NOTE_VOICES, ETYMOLOGY,
} from '../lib/configurations.mjs';

const SKIP_TAGS = new Set(['a', 'sup', 'code', 'pre', 'script', 'style', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const UNSAFE_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'link', 'meta', 'base']);

const WORDS = {
  en: { notes: 'Notes', back: 'Back to the text', keywords: 'Keywords' },
  de: { notes: 'Anmerkungen', back: 'Zurück zur Stelle', keywords: 'Schlagwörter' },
  tr: { notes: 'Notlar', back: 'Metne dön', keywords: 'Anahtar sözcükler' },
};
const text = (value) => ({ type: 'text', value });
const el = (tagName, properties, children = []) => ({ type: 'element', tagName, properties, children });
const classes = (n) => (n.type === 'element' ? [].concat(n.properties?.className ?? []) : []);

/** Remove elements and attributes that could run code (raw HTML in Markdown is not trusted). */
function sanitize(node) {
  if (!node.children) return;
  node.children = node.children.filter((c) => !(c.type === 'raw' || (c.type === 'element' && UNSAFE_TAGS.has(c.tagName))));
  for (const c of node.children) {
    if (c.type !== 'element') continue;
    for (const k of Object.keys(c.properties ?? {})) {
      const v = String(c.properties[k]);
      if (/^on/i.test(k) || ((k === 'href' || k === 'src') && /^\s*(javascript|data|vbscript):/i.test(v))) delete c.properties[k];
    }
    sanitize(c);
  }
}

/** Replace matches of rx inside text nodes with the nodes make() returns. */
function transform(node, rx, make, { skip = [], state = null } = {}) {
  if (!node.children) return;
  const out = [];
  for (const c of node.children) {
    if (c.type === 'text' && !(state && state.done)) {
      rx.lastIndex = 0;
      let last = 0, m, parts = null;
      while ((m = rx.exec(c.value))) {
        const made = make(m[0]);
        if (made) {
          parts ??= [];
          if (m.index > last) parts.push(text(c.value.slice(last, m.index)));
          parts.push(...[].concat(made));
          last = m.index + m[0].length;
          if (state) { state.done = true; break; }
        }
        if (m[0] === '') rx.lastIndex++;
      }
      if (parts) { if (last < c.value.length) parts.push(text(c.value.slice(last))); out.push(...parts); } else out.push(c);
      continue;
    }
    if (c.type === 'element' && !SKIP_TAGS.has(c.tagName) && !classes(c).some((k) => skip.includes(k))) transform(c, rx, make, { skip, state });
    out.push(c);
  }
  node.children = out;
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isFootnotes = (n) => n.type === 'element' && n.tagName === 'section' && ('dataFootnotes' in (n.properties ?? {}) || classes(n).includes('footnotes'));

/** The first mention of each person/concept (in the text, and again in the notes) carries the marker. */
function markFirst(scope) {
  const seen = new Set();
  const walk = (n) => {
    for (const c of n.children ?? []) {
      if (c.type !== 'element') continue;
      if (scope.type === 'root' && isFootnotes(c)) continue;
      const k = classes(c);
      if (k.includes('c') && !seen.has(c.properties.dataC)) {
        seen.add(c.properties.dataC);
        c.properties.className = [...k, 'first'];
        c.properties.tabIndex = 0;
      }
      walk(c);
    }
  };
  walk(scope);
}

export default function rehypePiece() {
  return (tree, file) => {
    const p = String(file.path ?? file.history?.[0] ?? '').replaceAll('\\', '/');
    let m = p.match(/content\/pieces\/([^/]+)\.md$/), slug, lang;
    if (m) { slug = m[1]; lang = 'en'; }
    else if ((m = p.match(/translations\/(de|tr)\/([^/]+)\.md$/))) { lang = m[1]; slug = m[2]; }
    else return;

    sanitize(tree);
    const notes = tree.children.find(isFootnotes);

    // notes quoting several authors: each voice on its own line
    if (notes) transform(notes, new RegExp(`\\s+(?=${NOTE_VOICES})`, 'gu'), () => [text(' '), el('br', { className: ['nq-br'] })]);
    // quotations of five words or more (shorter ones are scare quotes)
    transform(tree, /“[^“”]{8,900}?”|„[^„“]{8,900}?“|"[^"]{8,900}?"/gu,
      (s) => (s.split(/\s+/).length >= 5 ? el('span', { className: ['qt'] }, [text(s)]) : null));
    // citations: (Koyré 1957, p. viii)
    transform(tree, /\((?=[^()]*\b(?:1[5-9]\d\d|20\d\d)\b)[A-ZÀ-ÖØ-Þ][^()]{0,60}\)/gu, (s) => el('span', { className: ['cite'] }, [text(s)]));
    // words talked about as words
    for (const [phrase, marked] of WORD_AS_WORD[`${slug}/${lang}`] ?? []) {
      transform(tree, new RegExp(escape(phrase), 'gu'), () =>
        marked.split(/(<[^>]+>)/).filter(Boolean).map((s) => (s.startsWith('<') ? el('em', { className: ['ed'] }, [text(s.slice(1, -1))]) : text(s))));
    }
    // editorial italics: titles of works, foreign terms
    const terms = [...ITALIC_TERMS].sort((a, b) => b.length - a.length).map(escape).join('|');
    transform(tree, new RegExp(`(?<![\\p{L}\\p{N}_])(?:${terms})(?![\\p{L}\\p{N}_])`, 'gu'), (s) => el('em', { className: ['ed'] }, [text(s)]), { skip: ['ed'] });
    // people: every one, as a tribute
    for (const [key, , rx] of PEOPLE) {
      transform(tree, compile(personPattern(rx, lang)), (s) => el('span', { className: ['c', 'c-person'], dataC: key }, [text(s)]), { skip: ['c'] });
    }
    // concepts: only those that also appear in another published piece (recounted on every build)
    for (const [key, , rx] of VOCAB) {
      const { df, key: isKey } = conceptStats(key);
      if (df < 2) continue;
      transform(tree, compile(rx[lang], conceptFlags(lang)),
        (s) => el('span', { className: ['c', 'c-concept'], dataC: key, dataTier: isKey ? 'key' : 'normal' }, [text(s)]), { skip: ['c', 'qt', 'ed'] });
    }
    // etymology: the first time each root word appears
    for (const { key, words } of ETYMOLOGY) {
      for (const w of words) {
        transform(tree, compile(escape(w)), (s) => el('span', { className: ['ety'], dataEty: key, tabIndex: 0, role: 'button', ariaHasPopup: 'dialog' }, [text(s)]),
          { skip: ['ety'], state: { done: false } });
      }
    }
    markFirst(tree);
    if (notes) markFirst(notes);

    // notes: a visible heading and back links in the page's language
    const t = WORDS[lang];
    if (notes) {
      const h = notes.children.find((c) => c.type === 'element' && c.tagName === 'h2');
      if (h) { h.children = [text(t.notes)]; h.properties.className = classes(h).filter((k) => k !== 'sr-only'); }
      const relabel = (n) => (n.children ?? []).forEach((c) => {
        if (c.type !== 'element') return;
        if ('dataFootnoteBackref' in (c.properties ?? {})) c.properties.ariaLabel = String(c.properties.ariaLabel ?? '').replace(/^Back to reference/, t.back);
        relabel(c);
      });
      relabel(notes);
    }
    // keywords (automatic, from the front matter): small, right after the text, before the notes
    const kw = file.data?.astro?.frontmatter?.keywords;
    if (Array.isArray(kw) && kw.length) {
      const k = el('p', { className: ['keywords'] }, [el('span', { className: ['kw-label'] }, [text(t.keywords)]), text(' '),
        ...kw.flatMap((w, i) => [...(i ? [el('span', { className: ['kw-sep'], ariaHidden: 'true' }, [text('·')])] : []), el('span', { className: ['kw'] }, [text(String(w))])])]);
      const i = notes ? tree.children.indexOf(notes) : tree.children.length;
      tree.children.splice(i, 0, k);
    }
  };
}
