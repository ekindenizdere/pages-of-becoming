// Configurations: the people, key concepts and word roots that connect Ekin's pieces.
// One source for the piece pages (highlights, etymology cards) and the map page.
// Everything that depends on the texts (in which pieces a concept appears, the sentence there)
// is recounted from the Markdown files on every build, so it stays current when a piece is added.
//
// To add a concept or a person: add a line below (English, German, Turkish patterns).
import fs from 'node:fs';
import path from 'node:path';

export const LANGS = ['en', 'de', 'tr'];
const ROOT = process.cwd();
const PIECES_DIR = path.join(ROOT, 'src/content/pieces');
const TRANSLATIONS_DIR = path.join(ROOT, 'translations');

// Patterns are written with \w; it is widened to any letter (ş, ı, é, Greek…) when compiled.
const L = '[\\p{L}\\p{N}_]';
const widen = (rx) => rx.replaceAll('\\w', L);
export const compile = (rx, flags = '') => new RegExp(`(?<![\\p{L}\\p{N}_-])(?:${widen(rx)})(?!${L})`, `gu${flags}`);

// ---------- concepts (blue) ----------
// Highlighted in a piece only when they also appear in another published piece.
// Key concepts (full blue marker): Ekin's own (KEY_OWN, provisional) or found in KEY_MIN_PIECES pieces or more.
export const KEY_OWN = new Set(['configuration', 'organism', 'change', 'form', 'living-systems', 'reflection']);
export const KEY_MIN_PIECES = 4;
export const IDIOMS = [/never mind/gi];
// German nouns are capitalised, so German is matched as written ("selbst" is not "das Selbst");
// English and Turkish ignore capitals (a sentence may start with the word).
export const conceptFlags = (lang) => (lang === 'de' ? '' : 'i');

export const VOCAB = [
  ['configuration', { en: 'configuration', de: 'Konfiguration', tr: 'konfigürasyon' }, { en: 'configurations?', de: 'Konfiguration\\w*', tr: 'konfigürasyon\\w*' }],
  ['change', { en: 'change', de: 'Veränderung', tr: 'değişim' }, { en: 'chang(?:e|es|ed|ing)', de: '[Vv]eränder\\w*|[Ww]andel\\w*', tr: 'değiş\\w*' }],
  ['form', { en: 'form', de: 'Form', tr: 'biçim' }, { en: '(?:de-|re-)?forms?', de: 'Formen|Form', tr: 'biçim(?:ler|i|ini)?' }],
  ['living-systems', { en: 'living systems', de: 'lebende Systeme', tr: 'canlı sistemler' }, { en: 'living systems?', de: '[Ll]ebende[nrs]? Systeme?\\w*', tr: 'canlı sistem\\w*' }],
  ['organism', { en: 'organism', de: 'Organismus', tr: 'organizma' }, { en: 'organisms?', de: 'Organism\\w*', tr: 'organizma\\w*' }],
  ['reflection', { en: 'reflection', de: 'Reflexion', tr: 'düşünüm' }, { en: 'reflection', de: 'Reflexion', tr: 'düşünüm\\w*' }],
  ['mind', { en: 'mind', de: 'Geist', tr: 'zihin' }, { en: '(?<!never )minds?', de: 'Geist\\w*', tr: 'zihn\\w*|zihin\\w*' }],
  ['nature', { en: 'nature', de: 'Natur', tr: 'doğa' }, { en: 'nature', de: 'Natur', tr: 'doğa(?:nın|yı|da|ya)?' }],
  ['reality', { en: 'reality', de: 'Wirklichkeit', tr: 'gerçeklik' }, { en: 'reality', de: 'Wirklichkeit|Realität', tr: 'gerçeklik\\w*' }],
  ['experience', { en: 'experience', de: 'Erfahrung', tr: 'deneyim' }, { en: 'experiences?', de: 'Erfahrung\\w*', tr: 'deneyim\\w*' }],
  ['self', { en: 'self', de: 'Selbst', tr: 'benlik' }, { en: 'self', de: 'Selbst', tr: 'benlik\\w*' }],
  ['qualities', { en: 'qualities', de: 'Qualitäten', tr: 'nitelikler' }, { en: 'qualit(?:y|ies)', de: 'Qualität\\w*', tr: 'nitelik\\w*' }],
  ['philosophy', { en: 'philosophy', de: 'Philosophie', tr: 'felsefe' }, { en: 'philosoph\\w*', de: 'Philosoph\\w*', tr: 'felsef\\w*' }],
  ['revolution', { en: 'revolution', de: 'Revolution', tr: 'devrim' }, { en: 'revolutions?', de: 'Revolution\\w*', tr: 'devrim\\w*' }],
  ['perception', { en: 'perception', de: 'Wahrnehmung', tr: 'algı' }, { en: 'percei\\w*|perception', de: '[Ww]ahrnehm\\w*', tr: 'algı\\w*|algıla\\w*' }],
  ['environment', { en: 'environment', de: 'Umwelt', tr: 'çevre' }, { en: 'environment', de: 'Umwelt\\w*', tr: 'çevre\\w*|çevrey\\w*' }],
  ['civilization', { en: 'civilization', de: 'Zivilisation', tr: 'uygarlık' }, { en: 'civilization', de: 'Zivilisation\\w*', tr: 'uygarlı\\w*' }],
  ['constraint', { en: 'constraint', de: 'Beschränkung', tr: 'kısıt' }, { en: 'constrain\\w*', de: '[Bb]eschränk\\w*|[Ee]inschränk\\w*', tr: 'kısıt\\w*' }],
  ['process', { en: 'process', de: 'Prozess', tr: 'süreç' }, { en: 'process(?:es)?', de: 'Prozess\\w*', tr: 'süre[cç]\\w*' }],
  ['patterns', { en: 'patterns', de: 'Muster', tr: 'örüntü' }, { en: 'patterns?', de: 'Muster\\w*', tr: 'örüntü\\w*' }],
  ['necessity', { en: 'necessity', de: 'Notwendigkeit', tr: 'zorunluluk' }, { en: 'necessit\\w*|necessary', de: '[Nn]otwendig\\w*', tr: 'zorunlu\\w*' }],
  ['structure', { en: 'structure', de: 'Struktur', tr: 'yapı' }, { en: 'structur\\w*', de: '[Ss]truktur\\w*', tr: 'yapı(?:sal|sı|yı|lar)?' }],
  ['existence', { en: 'existence', de: 'Existenz', tr: 'varoluş' }, { en: 'existen\\w*', de: '[Ee]xisten\\w*', tr: 'varoluş\\w*' }],
  ['biology', { en: 'biology', de: 'Biologie', tr: 'biyoloji' }, { en: 'biolog\\w*', de: '[Bb]iolog\\w*', tr: 'biyoloj\\w*' }],
  ['criticism', { en: 'criticism', de: 'Kritik', tr: 'eleştiri' }, { en: 'critici\\w*|critical', de: 'Kritik\\w*|kritisch\\w*', tr: 'eleştir\\w*' }],
  ['suffering', { en: 'suffering', de: 'Leiden', tr: 'acı' }, { en: 'suffer\\w*', de: '[Ll]eid(?:en|ens)?', tr: 'acı(?:yı|nın|dan|ya|lar\\w*)?' }],
  ['acceleration', { en: 'acceleration', de: 'Beschleunigung', tr: 'ivmelenme' }, { en: 'accelerat\\w*', de: '[Bb]eschleunig\\w*', tr: 'ivme\\w*' }],
  ['viability', { en: 'viability', de: 'Viabilität', tr: 'yaşayabilirlik' }, { en: 'viability|viable', de: 'Viabilität|viabel|lebensfähig\\w*', tr: 'yaşayabilir\\w*' }],
  ['progress', { en: 'progress', de: 'Fortschritt', tr: 'ilerleme' }, { en: 'progress', de: 'Fortschritt\\w*', tr: '[İi]lerleme\\w*' }],
  ['science', { en: 'science', de: 'Wissenschaft', tr: 'bilim' }, { en: 'scien(?:ce|ces|tific)', de: '[Ww]issenschaft\\w*', tr: 'bilim\\w*' }],
];

// ---------- people (grey): every person named, as a quiet tribute ----------
export const PEOPLE = [
  ['varela', 'Francisco Varela', '(?:Francisco )?Varela'],
  ['husserl', 'Edmund Husserl', '(?:Edmund )?Husserl'],
  ['merleau-ponty', 'Maurice Merleau-Ponty', '(?:Maurice )?Merleau-Ponty'],
  ['heidegger', 'Martin Heidegger', 'Heidegger'],
  ['heraclitus', 'Heraclitus', 'Heraclitus|Heraklit|Herakleitos'],
  ['goethe', 'Johann Wolfgang von Goethe', 'Goethe'],
  ['von-foerster', 'Heinz von Foerster', '(?:Heinz )?(?:von )?Foerster'],
  ['buddha', 'the Buddha', 'Buddha'],
  ['voros', 'Sebastjan Vörös', '(?:Sebastjan )?Vörös'],
  ['dupuy', 'Jean-Pierre Dupuy', 'Dupuy'],
  ['kelly', 'Kevin Kelly', '(?:Kevin )?Kelly'],
  ['koyre', 'Alexandre Koyré', '(?:Alexandre )?Koyr[eé]'],
  ['galileo', 'Galileo Galilei', 'Galileo(?: Galilei)?|Galilei'],
  ['descartes', 'René Descartes', 'Descartes'],
  ['newton', 'Isaac Newton', 'Newton'],
  ['whitehead', 'Alfred North Whitehead', 'Whitehead'],
  ['thompson', 'Thompson et al.', 'Thompson'],
  ['democritus', 'Democritus', 'Democritus|Demokritos|Demokrit'],
  ['aristotle', 'Aristotle', 'Aristotle|Aristoteles'],
  ['locke', 'John Locke', 'Locke'],
  ['pythagoras', 'Pythagoras', 'Pythagoras'],
  ['watson', 'John B. Watson', 'Watson'],
  ['skinner', 'B. F. Skinner', 'Skinner'],
  ['jonas', 'Hans Jonas', 'Jonas'],
  ['rosenblatt', 'Frank Rosenblatt', 'Rosenblatt'],
  ['shannon', 'Claude Shannon', 'Shannon'],
  ['von-neumann', 'John von Neumann', '(?:von )?Neumann'],
  ['turing', 'Alan Turing', 'Turing'],
  ['mcculloch', 'Warren McCulloch', 'McCulloch'],
  ['pitts', 'Walter Pitts', 'Pitts'],
  ['minsky', 'Marvin Minsky', 'Minsky'],
  ['edmonds', 'Dean Edmonds', '(?:Dean )?Edmonds'],
  ['hassabis', 'Demis Hassabis', '(?:Demis )?Hassabis'],
  ['jumper', 'John Jumper', '(?:John )?Jumper'],
  ['baker', 'David Baker', '(?:David )?Baker'],
  ['spencer-brown', 'George Spencer-Brown', 'Spencer-Brown'],
];
// German adds a genitive -s (Varelas); Turkish suffixes come after an apostrophe and are left out.
export const personPattern = (rx, lang) => (lang === 'de' ? `(?:${rx})s?` : rx);
export const personLabel = { aristotle: { de: 'Aristoteles', tr: 'Aristoteles' }, democritus: { de: 'Demokrit', tr: 'Demokritos' }, buddha: { de: 'Buddha', tr: 'Buddha' } };

// ---------- italics, by rule: titles of works, Latin/Greek/other foreign terms ----------
export const ITALIC_TERMS = [
  'Philosophiae Naturalis Principia Mathematica', 'De Revolutionibus Orbium Coelestium', 'scientia activa et operativa',
  'Scientia contemplativa', 'scientia contemplativa', 'De Anima', 'Principia', 'dynamis', 'Discourse on Method',
  'Discours de la méthode', 'Yöntem Üzerine Konuşma', 'Principles of Philosophy', 'Prinzipien der Philosophie', 'Felsefenin İlkeleri',
  'Faust I', 'Faust II', 'Faust', 'epoche', 'Epoché', 'epoché', 'In nuce', 'in nuce', 'taṇhā', 'μεταβάλλον ἀναπαύεται',
  'Nur die Fragen, die im Prinzip unentscheidbar sind, können wir entscheiden',
];
// A word talked about as a word (by piece and language)
export const WORD_AS_WORD = {
  'on-progress/en': [['the word better means', 'the word <better> means'], ['from the world changes to the acceleration of change is now the constant', 'from <the world changes> to <the acceleration of change is now the constant>']],
  'on-progress/de': [['das Wort besser bedeutet', 'das Wort <besser> bedeutet']],
  'on-progress/tr': [['çünkü daha iyi sözcüğü', 'çünkü <daha iyi> sözcüğü']],
};
// In a note made of several quoted voices, each voice starts a new line
export const NOTE_VOICES = '(?:Democritus|Demokrit\\w*|Aristotle|Aristoteles|Descartes|Locke)(?=:)';

// ---------- etymology: italic words with a card ----------
export const ETYMOLOGY = [
  { key: 'progress', words: ['progressus', 'Pro-', 'gressus'], cards: {
    en: { head: 'progressus', lines: ['Latin <i>prōgressus</i>, “a going forward”', '<i>prō-</i> “forward” + <i>gradī</i> “to step, to walk”'], also: { slug: 'on-problems-disturbances-and-mysteries', text: 'The same <i>pro-</i> is in Greek <i>πρό-βλημα</i>, “thrown before”.' } },
    de: { head: 'progressus', lines: ['lateinisch <i>prōgressus</i>, „ein Vorwärtsgehen“', '<i>prō-</i> „vorwärts“ + <i>gradī</i> „schreiten, gehen“'], also: { slug: 'on-problems-disturbances-and-mysteries', text: 'Dasselbe <i>pro-</i> steckt im griechischen <i>πρό-βλημα</i>, „das Vorgeworfene“.' } },
    tr: { head: 'progressus', lines: ['Latince <i>prōgressus</i>, “ileri gidiş”', '<i>prō-</i> “ileri” + <i>gradī</i> “adım atmak, yürümek”'], also: { slug: 'on-problems-disturbances-and-mysteries', text: 'Aynı <i>pro-</i>, Yunanca <i>πρό-βλημα</i>’da da var: “öne atılan”.' } } } },
  { key: 'centric', words: ['geo', 'kentron', 'helios'], cards: {
    en: { head: 'geo · kentron · helios', lines: ['<i>geo-</i>: Greek <i>γῆ</i> (gē), “earth”', '<i>kentron</i>: <i>κέντρον</i>, first “a sharp point, a goad”, then the fixed point of a pair of compasses: the centre', '<i>helio-</i>: <i>ἥλιος</i> (hēlios), “sun”'] },
    de: { head: 'geo · kentron · helios', lines: ['<i>geo-</i>: griechisch <i>γῆ</i> (gē), „Erde“', '<i>kentron</i>: <i>κέντρον</i>, zuerst „Stachel, Spitze“, dann der feste Punkt des Zirkels: der Mittelpunkt', '<i>helio-</i>: <i>ἥλιος</i> (hēlios), „Sonne“'] },
    tr: { head: 'geo · kentron · helios', lines: ['<i>geo-</i>: Yunanca <i>γῆ</i> (gē), “yer, toprak”', '<i>kentron</i>: <i>κέντρον</i>, önce “sivri uç, üvendire”, sonra pergelin sabit ucu: merkez', '<i>helio-</i>: <i>ἥλιος</i> (hēlios), “güneş”'] } } },
  { key: 'necessity', words: ['necessitas', 'cedere'], cards: {
    en: { head: 'necessitas', lines: ['Latin <i>necessitas</i>, “unavoidability”', '<i>ne-</i> “not” + <i>cedere</i> “to yield, to give way”: what does not give way'] },
    de: { head: 'necessitas', lines: ['lateinisch <i>necessitas</i>, „Unausweichlichkeit“', '<i>ne-</i> „nicht“ + <i>cedere</i> „weichen, nachgeben“: was nicht weicht'] },
    tr: { head: 'necessitas', lines: ['Latince <i>necessitas</i>, “kaçınılmazlık”', '<i>ne-</i> “değil” + <i>cedere</i> “geri çekilmek, boyun eğmek”: geri çekilmeyen'] } } },
  { key: 'problem', words: ['πρόβλημα', 'πρό', 'βάλλειν'], cards: {
    en: { head: 'πρόβλημα · problēma', lines: ['Greek <i>πρόβλημα</i>, “something thrown in front”: an obstacle', '<i>πρό</i> (pro) “before” + <i>βάλλειν</i> (ballein) “to throw”'], also: { slug: 'on-progress', text: 'The same <i>pro-</i> is in Latin <i>prōgressus</i>, “a going forward”.' } },
    de: { head: 'πρόβλημα · problēma', lines: ['griechisch <i>πρόβλημα</i>, „das Vorgeworfene“: ein Hindernis', '<i>πρό</i> (pro) „vor“ + <i>βάλλειν</i> (ballein) „werfen“'], also: { slug: 'on-progress', text: 'Dasselbe <i>pro-</i> steckt im lateinischen <i>prōgressus</i>, „ein Vorwärtsgehen“.' } },
    tr: { head: 'πρόβλημα · problēma', lines: ['Yunanca <i>πρόβλημα</i>, “öne atılan şey”: engel', '<i>πρό</i> (pro) “önce, önüne” + <i>βάλλειν</i> (ballein) “atmak”'], also: { slug: 'on-progress', text: 'Aynı <i>pro-</i>, Latince <i>prōgressus</i>’ta da var: “ileri gidiş”.' } } } },
  { key: 'metabolism', words: ['μεταβάλλειν'], cards: {
    en: { head: 'μεταβάλλειν · metaballein', lines: ['Greek <i>μεταβάλλειν</i>, “to throw beyond; to change”', '<i>μετά</i> (meta) “beyond” + <i>βάλλειν</i> (ballein) “to throw”: the same throwing as in <i>problem</i>'] },
    de: { head: 'μεταβάλλειν · metaballein', lines: ['griechisch <i>μεταβάλλειν</i>, „hinüberwerfen; verändern“', '<i>μετά</i> (meta) „über … hinaus“ + <i>βάλλειν</i> (ballein) „werfen“: dasselbe Werfen wie in <i>Problem</i>'] },
    tr: { head: 'μεταβάλλειν · metaballein', lines: ['Yunanca <i>μεταβάλλειν</i>, “öteye atmak; değişmek”', '<i>μετά</i> (meta) “öte” + <i>βάλλειν</i> (ballein) “atmak”: <i>problem</i>’deki atmanın aynısı'] } } },
  { key: 'disturbance', words: ['turbare', 'Disturbāre'], cards: {
    en: { head: 'disturbāre', lines: ['Latin <i>disturbāre</i>, “to throw into disorder”', '<i>dis-</i> “apart, in different directions” + <i>turbāre</i> “to stir, to agitate”, from <i>turba</i>, “turmoil” (hence <i>turbulence</i>)'] },
    de: { head: 'disturbāre', lines: ['lateinisch <i>disturbāre</i>, „in Unordnung bringen“', '<i>dis-</i> „auseinander“ + <i>turbāre</i> „aufwühlen“, von <i>turba</i>, „Getümmel“ (daher <i>Turbulenz</i>)'] },
    tr: { head: 'disturbāre', lines: ['Latince <i>disturbāre</i>, “düzenini bozmak”', '<i>dis-</i> “ayrı, farklı yönlere” + <i>turbāre</i> “karıştırmak, çalkalamak”; <i>turba</i>, “kargaşa” sözcüğünden (<i>türbülans</i> buradan gelir)'] } } },
];

// ---------- reading the pieces ----------
const front = (text) => {
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"|"$/g, '');
  }
  return { meta, body: m[2] };
};
export const sourceFile = (slug, lang) => (lang === 'en' ? path.join(PIECES_DIR, `${slug}.md`) : path.join(TRANSLATIONS_DIR, lang, `${slug}.md`));

let cache = null;
function load() {
  if (cache) return cache;
  const pieces = fs.readdirSync(PIECES_DIR).filter((f) => f.endsWith('.md')).map((f) => {
    const slug = f.slice(0, -3);
    const { meta } = front(fs.readFileSync(path.join(PIECES_DIR, f), 'utf8'));
    const texts = {}, titles = {};
    for (const lang of LANGS) {
      const file = sourceFile(slug, lang);
      if (!fs.existsSync(file)) continue;
      const { meta: m, body } = front(fs.readFileSync(file, 'utf8'));
      titles[lang] = m.title;
      texts[lang] = body.replace(/^\[\^\d+\]:\s*/gm, '').replace(/\[\^\d+\]/g, '');
    }
    return { slug, kind: meta.kind, status: meta.status, order: Number(meta.order), titles, texts };
  }).filter((p) => p.status === 'published').sort((a, b) => (a.kind + a.order).localeCompare(b.kind + b.order));

  const strip = (t) => IDIOMS.reduce((s, rx) => s.replace(rx, ' '), t);
  const find = (piece, lang, rx) => {
    const text = piece.texts[lang];
    if (!text) return null;
    const t = strip(text);
    rx.lastIndex = 0;
    const m = rx.exec(t);
    if (!m) return null;
    // the sentence around the first mention, trimmed to about 220 characters
    const start = Math.max(t.lastIndexOf('. ', m.index), t.lastIndexOf('\n', m.index)) + 1;
    const ends = [t.indexOf('. ', m.index + m[0].length), t.indexOf('\n', m.index + m[0].length)].filter((x) => x !== -1);
    const end = ends.length ? Math.min(...ends) + 1 : t.length;
    let sentence = t.slice(start, end).trim();
    if (sentence.length > 240) {
      const a = Math.max(0, m.index - start - 100);
      sentence = (a ? '… ' : '') + sentence.slice(a, a + 210).trim() + ' …';
    }
    return { text: sentence, word: m[0] };
  };
  const links = (patterns, flags) => {
    const where = [], ctx = {};
    for (const p of pieces) {
      const per = {};
      for (const lang of LANGS) {
        const c = find(p, lang, compile(patterns(lang), flags(lang)));
        if (c) per[lang] = c;
      }
      if (per.en) { where.push(p.slug); ctx[p.slug] = per; }
    }
    return { in: where, ctx };
  };
  const concepts = Object.fromEntries(VOCAB.map(([key, labels, rx]) => {
    const l = links((lang) => rx[lang], conceptFlags);
    return [key, { labels, ...l, key: KEY_OWN.has(key) || l.in.length >= KEY_MIN_PIECES }];
  }));
  const people = Object.fromEntries(PEOPLE.map(([key, label, rx]) => {
    const labels = { en: label, de: personLabel[key]?.de ?? label, tr: personLabel[key]?.tr ?? label };
    return [key, { labels, ...links((lang) => personPattern(rx, lang), () => '') }];
  }));
  cache = { pieces, concepts, people };
  return cache;
}

/** Everything the map and the hover cards need, in one language. */
export function configurations(lang = 'en') {
  const { pieces, concepts, people } = load();
  const pick = (o, k) => ({ label: o.labels[lang] ?? o.labels.en, in: o.in, key: !!o.key,
    ctx: Object.fromEntries(Object.entries(o.ctx).map(([s, per]) => [s, per[lang] ?? per.en])) });
  return {
    pieces: Object.fromEntries(pieces.map((p) => [p.slug, { title: p.titles[lang] ?? p.titles.en, kind: p.kind }])),
    concepts: Object.fromEntries(Object.entries(concepts).map(([k, o]) => [k, pick(o, k)])),
    people: Object.fromEntries(Object.entries(people).filter(([, o]) => o.in.length).map(([k, o]) => [k, pick(o, k)])),
  };
}
export const conceptStats = (key) => { const c = load().concepts[key]; return { df: c.in.length, key: c.key }; };
