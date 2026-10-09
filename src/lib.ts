import { getCollection, type CollectionEntry } from 'astro:content';

export type Piece = CollectionEntry<'pieces'>;

/** Prefix an internal path with the site base (needed on GitHub Pages). */
export const url = (path = '') =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

export const pieceUrl = (p: Piece) => url(`pieces/${p.id}/`);

export const kindLabel = { opinion: 'Opinion', article: 'Article' } as const;

export async function pieces(kind?: Piece['data']['kind']) {
  const all = await getCollection('pieces', (p) => !kind || p.data.kind === kind);
  return all.sort((a, b) => a.data.order - b.data.order);
}

/** Rough reading time from the raw Markdown. */
export const minutes = (p: Piece) =>
  Math.max(1, Math.round((p.body ?? '').split(/\s+/).length / 220));
