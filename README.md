# Pages of Becoming

Essays on philosophy, cognitive science and science by Ekin Deniz Dere.
Live at https://ekindenizdere.github.io/pages-of-becoming/

## Adding or editing a piece
Each piece is one Markdown file in `src/content/pieces/`. The top block sets:

| Field | Values |
|---|---|
| `title` | the title |
| `kind` | `opinion` or `article` |
| `status` | `published` or `upcoming` (upcoming pieces are listed but get no page) |
| `order` | position within its section |
| `dedication`, `teaser`, `date` | optional |

Footnotes: write `[^1]` in the text and `[^1]: the note` at the end. They are numbered automatically.
Optional `keywords: ["…", "…", "…"]` in the top block: three words particular to the piece, shown small after the text.

## The piece template and the map
Every piece is shaped automatically when the site is built (`src/plugins/rehype-piece.mjs`): people get a grey half marker,
concepts that also appear in another published piece get a blue marker (full for key concepts), titles of works and
foreign terms are set in italics, quotations in italics, and etymology words get a card. Notes appear in the margin.
The list of concepts, people, etymologies and italic terms is in **`src/lib/configurations.mjs`**: add a line there to add one.
Which pieces share which concept is recounted from the texts on every build, so the highlights and the map
(`/configurations/`, also in German and Turkish) update by themselves when a piece is added.
Raw HTML in a piece is stripped of anything that could run code.
Every change pushed to `main` rebuilds and republishes the site.

## Structure
- `src/pages/`: home (prototype C · Contents; its scripts and styles are in `public/home/`, display font switch in `public/home/glyphs.js`), Opinion Pieces, Articles, piece pages
- `src/styles/tokens.css`: design tokens from the prototype lab
- `public/fonts/`: free fonts (OFL) only. **PP Pangaia must never be committed here**: its EULA forbids public repositories, and the live site needs a Pangram web licence.

## Local
`npm install`, then `npm run dev`.
