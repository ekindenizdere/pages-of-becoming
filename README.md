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
Every change pushed to `main` rebuilds and republishes the site.

## Structure
- `src/pages/`: home (prototype C · Contents; its scripts and styles are in `public/home/`, display font switch in `public/home/glyphs.js`), Opinion Pieces, Articles, piece pages
- `src/styles/tokens.css`: design tokens from the prototype lab
- `public/fonts/`: free fonts (OFL) only. **PP Pangaia must never be committed here**: its EULA forbids public repositories, and the live site needs a Pangram web licence.

## Local
`npm install`, then `npm run dev`.
