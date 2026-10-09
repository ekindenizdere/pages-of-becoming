// All wording on the home page, per language. The German and Turkish texts are machine translations
// (the English is the original). Names, the site title and citations stay as they are.
export type Lang = 'en' | 'de' | 'tr';

type Quote = { author: string; text: string; cite: string };
interface HomeText {
  description: string; language: string; opinion: string; articles: string; about: string;
  sub: string;
  contents: string; portraitAlt: string; bio: string; note?: string;
  elsewhere: string; linkedin: string; forbes: string;
  question: string; inkA: string; inkB: string;
  min: string; becoming: string; motion: [string, string];
  quotes: [Quote, Quote, Quote];
}

export const homeText: Record<Lang, HomeText> = {
  en: {
    description: 'Essays on philosophy, cognitive science and science by Ekin Deniz Dere.',
    language: 'Language', opinion: 'Opinion Pieces', articles: 'Articles', about: 'About',
    sub: 'The usual confusion but framed professionally',
    contents: 'Contents', portraitAlt: 'Portrait of Ekin Deniz Dere',
    bio: 'I’m Ekin Deniz Dere, a cognitive scientist and science communicator mainly interested in how people and artificial systems make sense of the worlds they create through various forms of interactivity.',
    elsewhere: 'Ekin elsewhere', linkedin: 'Ekin Deniz Dere on LinkedIn', forbes: 'Ekin Deniz Dere’s articles on Forbes Austria',
    question: 'The question',
    inkA: 'My background moves through economics, philosophy, and journalism, but keeps circling back to the question:',
    inkB: 'what does it mean to be who we are?',
    min: 'min', becoming: 'becoming', motion: ['Motion on', 'Motion off'],
    quotes: [
      { author: 'Thomas Nagel', text: 'There is no view from nowhere.', cite: '1986, paraphrase' },
      { author: 'Francisco J. Varela', text: 'Our current notions about evolution and brain will be as distant to our grandchildren as this animistic cosmology is to us today.', cite: '1987, p. 49' },
      { author: 'Howard H. Pattee', text: 'Since we are free to make our own syntactic rules we are also free to interpret inherently simple events as messages in our own elaborate symbolic systems, and indeed this is what has generated all mythologies and probably several sciences.', cite: '1977, p. 262' },
    ],
  },
  de: {
    description: 'Essays über Philosophie, Kognitionswissenschaft und Wissenschaft von Ekin Deniz Dere.',
    language: 'Sprache', opinion: 'Meinungsbeiträge', articles: 'Artikel', about: 'Über',
    sub: 'Die übliche Verwirrung, nur professionell gerahmt',
    contents: 'Inhalt', portraitAlt: 'Porträt von Ekin Deniz Dere',
    bio: 'Ich bin Ekin Deniz Dere, Kognitionswissenschaftlerin und Wissenschaftskommunikatorin. Mich interessiert vor allem, wie Menschen und künstliche Systeme den Welten Sinn geben, die sie durch verschiedene Formen der Interaktivität erschaffen.',
    note: 'Automatisch übersetzt. Das Original ist auf Englisch.',
    elsewhere: 'Ekin anderswo', linkedin: 'Ekin Deniz Dere auf LinkedIn', forbes: 'Artikel von Ekin Deniz Dere bei Forbes Austria',
    question: 'Die Frage',
    inkA: 'Mein Weg führt durch Ökonomie, Philosophie und Journalismus, kehrt aber immer wieder zu der Frage zurück:',
    inkB: 'Was bedeutet es, zu sein, wer wir sind?',
    min: 'Min.', becoming: 'im Werden', motion: ['Bewegung an', 'Bewegung aus'],
    quotes: [
      { author: 'Thomas Nagel', text: 'Es gibt keinen Blick von nirgendwo.', cite: '1986, Paraphrase' },
      { author: 'Francisco J. Varela', text: 'Unsere heutigen Vorstellungen von Evolution und Gehirn werden unseren Enkeln so fern sein, wie uns heute diese animistische Kosmologie ist.', cite: '1987, S. 49' },
      { author: 'Howard H. Pattee', text: 'Da wir frei sind, unsere eigenen syntaktischen Regeln aufzustellen, steht es uns auch frei, an sich einfache Ereignisse als Botschaften in unseren eigenen ausgefeilten Symbolsystemen zu deuten, und eben das hat alle Mythologien und wahrscheinlich mehrere Wissenschaften hervorgebracht.', cite: '1977, S. 262' },
    ],
  },
  tr: {
    description: 'Ekin Deniz Dere’den felsefe, bilişsel bilim ve bilim üzerine denemeler.',
    language: 'Dil', opinion: 'Görüş Yazıları', articles: 'Makaleler', about: 'Hakkında',
    sub: 'Her zamanki karmaşa, ama profesyonelce çerçevelenmiş',
    contents: 'İçindekiler', portraitAlt: 'Ekin Deniz Dere’nin portresi',
    bio: 'Ben Ekin Deniz Dere; bilişsel bilimci ve bilim iletişimcisiyim. Asıl ilgimi çeken, insanların ve yapay sistemlerin çeşitli etkileşim biçimleriyle yarattıkları dünyaları nasıl anlamlandırdığı.',
    note: 'Otomatik çeviridir. Özgün metin İngilizcedir.',
    elsewhere: 'Ekin başka yerlerde', linkedin: 'LinkedIn’de Ekin Deniz Dere', forbes: 'Ekin Deniz Dere’nin Forbes Austria yazıları',
    question: 'Soru',
    inkA: 'Geçmişim ekonomi, felsefe ve gazetecilik arasında dolaşıyor, ama hep aynı soruya dönüyor:',
    inkB: 'olduğumuz kişi olmak ne anlama geliyor?',
    min: 'dk', becoming: 'oluşta', motion: ['Hareket açık', 'Hareket kapalı'],
    quotes: [
      { author: 'Thomas Nagel', text: 'Hiçbir yerden bakış diye bir şey yoktur.', cite: '1986, açımlama' },
      { author: 'Francisco J. Varela', text: 'Evrim ve beyin hakkındaki bugünkü kavrayışlarımız torunlarımıza, bu animistik kozmolojinin bugün bize olduğu kadar uzak gelecek.', cite: '1987, s. 49' },
      { author: 'Howard H. Pattee', text: 'Kendi sözdizimsel kurallarımızı koymakta özgür olduğumuza göre, özünde basit olayları kendi karmaşık sembolik sistemlerimizde birer mesaj olarak yorumlamakta da özgürüz; bütün mitolojileri ve muhtemelen birkaç bilimi doğuran da tam olarak budur.', cite: '1977, s. 262' },
    ],
  },
};
