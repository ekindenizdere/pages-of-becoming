// Wording of the piece pages and the map, per language (German and Turkish are machine translations).
import type { Lang } from './home-text';

export const pieceText: Record<Lang, {
  opinion: string; article: string; notes: string; back: string; keywords: string;
  auto?: [string, string, string]; autoShort?: string; contents: string;
  alsoIn: string; onlyHere: string; openMap: string; close: string; note: string;
  map: {
    title: string; intro: string; search: string; pieces: string; concepts: string; people: string; keyConcepts: string;
    list: string; graph: string; zoomIn: string; zoomOut: string; reset: string; choose: string; appearsIn: (n: number) => string;
    inThisPiece: string; read: string; back: string; legend: string; legendPiece: string; legendKey: string; legendConcept: string; legendPerson: string;
    noMatch: string; hint: string; typePerson: string; typeConcept: string; typeKey: string;
  };
}> = {
  en: {
    opinion: 'Opinion', article: 'Article', notes: 'Notes', back: 'Back to the text', keywords: 'Keywords', contents: 'Contents',
    alsoIn: 'Also in', onlyHere: 'Only in this piece so far', openMap: 'Open in the map', close: 'Close', note: 'Note',
    map: {
      title: 'Configurations', intro: 'The people and key concepts that run through the pieces. Choose one to see where it appears and in which sentence.',
      search: 'Find a person, a concept or a piece', pieces: 'Pieces', concepts: 'Concepts', people: 'People', keyConcepts: 'Key concepts',
      list: 'As a list', graph: 'As a map', zoomIn: 'Zoom in', zoomOut: 'Zoom out', reset: 'Show all', choose: 'Point at a word to see its links; choose it to read them.',
      appearsIn: (n) => (n === 1 ? 'Appears in 1 piece' : `Appears in ${n} pieces`), inThisPiece: 'In this piece', read: 'Read the piece', back: 'Back to the piece',
      legend: 'How to read it', legendPiece: 'a piece', legendKey: 'a key concept', legendConcept: 'a shared concept', legendPerson: 'a person',
      noMatch: 'Nothing found', hint: 'Drag to move · pinch or use + and − to zoom', typePerson: 'Person', typeConcept: 'Concept', typeKey: 'Key concept',
    },
  },
  de: {
    opinion: 'Meinung', article: 'Artikel', notes: 'Anmerkungen', back: 'Zurück zur Stelle', keywords: 'Schlagwörter', contents: 'Inhalt',
    auto: ['Automatisch übersetzt. Das Original ist auf ', 'Englisch', '.'], autoShort: 'automatisch übersetzt',
    alsoIn: 'Auch in', onlyHere: 'Bisher nur in diesem Text', openMap: 'In der Karte öffnen', close: 'Schließen', note: 'Anmerkung',
    map: {
      title: 'Konfigurationen', intro: 'Die Menschen und Schlüsselbegriffe, die sich durch die Texte ziehen. Wählen Sie einen aus, um zu sehen, wo er vorkommt und in welchem Satz.',
      search: 'Person, Begriff oder Text suchen', pieces: 'Texte', concepts: 'Begriffe', people: 'Menschen', keyConcepts: 'Schlüsselbegriffe',
      list: 'Als Liste', graph: 'Als Karte', zoomIn: 'Vergrößern', zoomOut: 'Verkleinern', reset: 'Alles zeigen', choose: 'Zeigen Sie auf ein Wort, um seine Verbindungen zu sehen; wählen Sie es, um sie zu lesen.',
      appearsIn: (n) => (n === 1 ? 'Kommt in 1 Text vor' : `Kommt in ${n} Texten vor`), inThisPiece: 'In diesem Text', read: 'Text lesen', back: 'Zurück zum Text',
      legend: 'Lesehilfe', legendPiece: 'ein Text', legendKey: 'ein Schlüsselbegriff', legendConcept: 'ein gemeinsamer Begriff', legendPerson: 'eine Person',
      noMatch: 'Nichts gefunden', hint: 'Ziehen zum Verschieben · mit zwei Fingern oder + und − zoomen', typePerson: 'Person', typeConcept: 'Begriff', typeKey: 'Schlüsselbegriff',
    },
  },
  tr: {
    opinion: 'Görüş', article: 'Makale', notes: 'Notlar', back: 'Metne dön', keywords: 'Anahtar sözcükler', contents: 'İçindekiler',
    auto: ['Otomatik çeviridir. Özgün metin ', 'İngilizce', 'dir.'], autoShort: 'otomatik çeviri',
    alsoIn: 'Şurada da', onlyHere: 'Şimdilik yalnızca bu yazıda', openMap: 'Haritada aç', close: 'Kapat', note: 'Not',
    map: {
      title: 'Konfigürasyonlar', intro: 'Yazıların içinden geçen insanlar ve anahtar kavramlar. Nerede ve hangi cümlede geçtiğini görmek için birini seçin.',
      search: 'Bir kişi, kavram ya da yazı bulun', pieces: 'Yazılar', concepts: 'Kavramlar', people: 'İnsanlar', keyConcepts: 'Anahtar kavramlar',
      list: 'Liste olarak', graph: 'Harita olarak', zoomIn: 'Yakınlaştır', zoomOut: 'Uzaklaştır', reset: 'Tümünü göster', choose: 'Bağlantılarını görmek için bir sözcüğün üzerine gelin; okumak için seçin.',
      appearsIn: (n) => `${n} yazıda geçiyor`, inThisPiece: 'Bu yazıda', read: 'Yazıyı oku', back: 'Yazıya dön',
      legend: 'Nasıl okunur', legendPiece: 'bir yazı', legendKey: 'anahtar kavram', legendConcept: 'ortak kavram', legendPerson: 'bir kişi',
      noMatch: 'Bir şey bulunamadı', hint: 'Taşımak için sürükleyin · yakınlaştırmak için iki parmak ya da + ve −', typePerson: 'Kişi', typeConcept: 'Kavram', typeKey: 'Anahtar kavram',
    },
  },
};
