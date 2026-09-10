# mathieu-celerier.github.io

Mathieu Celerier's academic personal website: news, a web CV, a generated PDF resume, and
publications. Built with [Astro](https://astro.build/) on top of the
[Astro Theme Pure](https://github.com/cworld1/astro-theme-pure) template.

## Structure

- `/` – landing page with a compact recent-news list.
- `/news` – full news timeline (`src/content/news/*.mdx`).
- `/cv` – web CV, driven by `data/cv.yaml` via `src/lib/cv-data-loader.ts`.
- `/publications` – generated from `data/publications.bib` (+ `data/publications.overrides.yaml`).
- `/about` – profile, research interests, and tools/technical stack.
- `/cv.pdf` – PDF resume, rendered from `data/cv.yaml` through `src/templates/cv.tex.ejs`
  and compiled with XeLaTeX/latexmk (Awesome-CV class, vendored under `latex/awesome-cv`).

## Local development

Requirements:

- A current [Node.js](https://nodejs.org/) LTS release and npm.
- To regenerate the PDF CV: a TeX installation that provides `latexmk` and `xelatex`.

```sh
npm install

# runs all generators (publications, CV PDF), then starts the Astro dev server
npm run dev

# Astro diagnostics only, does not run generators
npm run check

# generators, theme check, Astro check, static build, Pagefind
npm run build

# regression tests for the publication generator
npm test
```

Publication Markdown under `src/content/publications/` and `public/cv.pdf` are generated
output (see `npm run gen`); don't hand-edit them — edit `data/publications.bib`,
`data/publications.overrides.yaml`, or `data/cv.yaml` instead.

## License

This project is licensed under the Apache 2.0 License, inherited from the
[Astro Theme Pure](https://github.com/cworld1/astro-theme-pure) template it's built on.
