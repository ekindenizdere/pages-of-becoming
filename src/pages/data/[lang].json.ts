// The people, concepts and pieces with the sentence where each appears, per language.
// Read by the "Also in" cards on the piece pages; recomputed from the texts on every build.
import type { APIRoute } from 'astro';
import { configurations } from '../../lib/configurations.mjs';

export function getStaticPaths() {
  return ['en', 'de', 'tr'].map((lang) => ({ params: { lang } }));
}
export const GET: APIRoute = ({ params }) =>
  new Response(JSON.stringify(configurations(params.lang)), { headers: { 'Content-Type': 'application/json' } });
