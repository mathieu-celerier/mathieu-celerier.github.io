# Changelog

All notable changes to this project are documented in this file.

## Unreleased

### Fixed

- Updated the local-font configuration for the current Astro font-provider API, restoring `npm run dev` after a fresh npm install.
- Added `@types/js-yaml` so TypeScript checks complete after `npm install`.

### Documentation

- Clarified that PDF-CV regeneration requires the system-provided `latexmk` and `xelatex` tools.
