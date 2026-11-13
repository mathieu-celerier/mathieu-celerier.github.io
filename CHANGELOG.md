# Changelog

All notable changes to this project are documented in this file.

## Unreleased

### Changed

- Publication labels: unpublished manuscripts are no longer shown as "Journal", venue names drop their duplicated year, and the chronological list links directly to paper, video, code, and project page.
- Publication dossiers only show a diagram where one describes the work, and typeset the compliance matrix in abstracts and highlights.
- Compliance lab: added a "Give it a push" button, a two-by-two mode switch, an HTML read-out, and larger scene labels on phones.
- Activity page: the current-project card states the project and its status, a lone talk is no longer listed twice, and log dates use the site's date format.
- Home page: research tracks link to their pages, internal links use → rather than ↗, and overlapping diagram labels were moved.
- CV: PhD entry lists the thesis, advisors, reviewers, and defense date; date ranges use en dashes and no longer break mid-phrase.
- News entries link to the publication they announce.

### Fixed

- Consecutive paragraphs ran together because the CSS reset removed their spacing.
- Research diagrams: labels were too small to read and the arm was clipped in the controller diagram.
- Explicit-compliance page showed the same controller diagram twice.

### Fixed

- Updated the local-font configuration for the current Astro font-provider API, restoring `npm run dev` after a fresh npm install.
- Added `@types/js-yaml` so TypeScript checks complete after `npm install`.

### Documentation

- Clarified that PDF-CV regeneration requires the system-provided `latexmk` and `xelatex` tools.
