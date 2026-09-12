import fs from 'node:fs'
import path from 'node:path'
import { parse } from '@retorquere/bibtex-parser'
import YAML from 'yaml'

const BIB_PATH = 'data/publications.bib'
const OVERRIDES_PATH = 'data/publications.overrides.yaml'
const OUT_DIR = 'src/content/publications'
const BIBTEX_OUT_DIR = 'public/bibtex'
const RIS_OUT_DIR = 'public/citations'

function loadOverrides() {
  if (!fs.existsSync(OVERRIDES_PATH)) return {}
  const raw = fs.readFileSync(OVERRIDES_PATH, 'utf8')
  const doc = YAML.parse(raw)
  return doc && typeof doc === 'object' ? doc : {}
}

const overrides = loadOverrides()

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function normalizeWhitespace(s) {
  return String(s ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .normalize('NFC')
}

function slugify(s) {
  return normalizeWhitespace(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function toYear(entry) {
  const y = entry.fields?.year
  const n = Number(String(y ?? '').replace(/[^0-9]/g, ''))
  return Number.isFinite(n) ? n : 0
}

function guessType(entry) {
  const t = (entry.type || '').toLowerCase()
  if (t === 'article') return 'journal'
  if (t === 'inproceedings') return 'conference'
  if (t === 'proceedings') return 'conference'
  if (t === 'phdthesis' || t === 'mastersthesis') return 'thesis'
  if (t === 'misc' || t === 'unpublished') return 'preprint'
  return 'other'
}

export function formatCreator(c) {
  if (c.name) return normalizeWhitespace(c.name)
  return normalizeWhitespace(
    [c.prefix, c.firstName, c.lastName, c.suffix].filter(Boolean).join(' ')
  )
}

export function joinAuthors(authorField) {
  // @retorquere/bibtex-parser yields creator-list fields as Creator[] objects,
  // not raw BibTeX strings.
  if (!Array.isArray(authorField)) return normalizeWhitespace(authorField)
  return authorField.map(formatCreator).filter(Boolean).join(', ')
}

function field(entry, name) {
  // parser yields keys lowercased in most cases, but be defensive
  const f = entry.fields || {}
  return f[name] ?? f[name?.toLowerCase()]
}

function pickVenue(entry) {
  return (
    field(entry, 'journaltitle') ||
    field(entry, 'journal') ||
    field(entry, 'booktitle') ||
    field(entry, 'publisher') ||
    ''
  )
}

function pickUrl(entry) {
  const url = field(entry, 'url')
  if (url) return String(url).trim()

  const doi = field(entry, 'doi')
  if (doi) return `https://doi.org/${String(doi).trim()}`

  return ''
}

export function escapeYaml(s) {
  // Safe YAML string for most cases
  const v = normalizeWhitespace(s)
  if (!v) return ''
  const needsQuotes = /[:\[\]{}#,>&*!|'"%@`]/.test(v)
  if (!needsQuotes) return v
  return JSON.stringify(v) // emits quoted string with escapes
}

function writeEntry(entry) {
  const bibkey = entry.key
  const o = overrides[bibkey] || {}

  const title = normalizeWhitespace(field(entry, 'title'))
  const authors = joinAuthors(field(entry, 'author') || [])
  const year = toYear(entry)
  const venue = normalizeWhitespace(pickVenue(entry))
  const doi = normalizeWhitespace(field(entry, 'doi'))
  const url = normalizeWhitespace(pickUrl(entry))
  const type = guessType(entry)

  // Website-only fields come ONLY from overrides:
  const pdf = typeof o.pdf === 'string' ? o.pdf : ''
  const code = typeof o.code === 'string' ? o.code : ''
  const video = typeof o.video === 'string' ? o.video : ''
  const website = typeof o.website === 'string' ? o.website : ''
  const featured = Boolean(o.featured)
  const status = typeof o.status === 'string' ? o.status : 'published'
  const highlights = Array.isArray(o.highlights)
    ? o.highlights.map(normalizeWhitespace).filter(Boolean)
    : []
  const citations =
    Number.isInteger(o.citation_count) && o.citation_count >= 0 ? o.citation_count : null

  // Override wins over the bib entry's own `abstract` field.
  const abstract = normalizeWhitespace(
    typeof o.abstract === 'string' ? o.abstract : field(entry, 'abstract') || ''
  )
  const image = typeof o.image === 'string' ? o.image : ''

  const safeSlug = slugify(`${year}-${bibkey}-${title || 'pub'}`) || slugify(bibkey) || bibkey
  const outPath = path.join(OUT_DIR, `${safeSlug}.md`)

  const frontmatterLines = [
    '---',
    `title: ${escapeYaml(title || bibkey)}`,
    `authors: ${escapeYaml(authors)}`,
    `year: ${year || 0}`,
    venue ? `venue: ${escapeYaml(venue)}` : '',
    `type: ${type}`,
    doi ? `doi: ${escapeYaml(doi)}` : '',
    url ? `url: ${escapeYaml(url)}` : '',
    `bibkey: ${escapeYaml(bibkey)}`,

    // Overrides (optional, only emitted if present)
    pdf ? `pdf: ${escapeYaml(pdf)}` : '',
    code ? `code: ${escapeYaml(code)}` : '',
    video ? `video: ${escapeYaml(video)}` : '',
    website ? `website: ${escapeYaml(website)}` : '',
    featured ? `featured: true` : '',
    status !== 'published' ? `status: ${escapeYaml(status)}` : '',
    citations !== null ? `citations: ${citations}` : '',
    image ? `image: ${escapeYaml(image)}` : '',
    abstract ? `abstract: ${escapeYaml(abstract)}` : '',
    highlights.length
      ? `highlights:\n${highlights.map((h) => `  - ${escapeYaml(h)}`).join('\n')}`
      : '',
    '---',
    ''
  ].filter(Boolean)

  fs.writeFileSync(outPath, frontmatterLines.join('\n'), 'utf8')

  // The raw original BibTeX source for this entry, exposed for copy/download
  // on the publications page. `entry.input` is the verbatim source text as
  // parsed by @retorquere/bibtex-parser, not a reconstruction from fields.
  if (entry.input) {
    fs.writeFileSync(path.join(BIBTEX_OUT_DIR, `${bibkey}.bib`), entry.input, 'utf8')
  }

  const risTypes = { journal: 'JOUR', conference: 'CONF', thesis: 'THES', preprint: 'UNPB' }
  const ris =
    [
      `TY  - ${risTypes[type] || 'GEN'}`,
      ...(field(entry, 'author') || []).map((author) => `AU  - ${formatCreator(author)}`),
      `TI  - ${title || bibkey}`,
      year ? `PY  - ${year}` : '',
      venue ? `T2  - ${venue}` : '',
      doi ? `DO  - ${doi}` : '',
      url ? `UR  - ${url}` : '',
      'ER  -',
      ''
    ]
      .filter(Boolean)
      .join('\n') + '\n'
  fs.writeFileSync(path.join(RIS_OUT_DIR, `${bibkey}.ris`), ris, 'utf8')
}

function main() {
  const bib = fs.readFileSync(BIB_PATH, 'utf8')
  const parsed = parse(bib, { sentenceCase: false })
  const entries = parsed.entries || []

  ensureDir(OUT_DIR)
  ensureDir(BIBTEX_OUT_DIR)
  ensureDir(RIS_OUT_DIR)

  // Clean previous generated files
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (f.endsWith('.md')) fs.unlinkSync(path.join(OUT_DIR, f))
  }
  for (const f of fs.readdirSync(BIBTEX_OUT_DIR)) {
    if (f.endsWith('.bib')) fs.unlinkSync(path.join(BIBTEX_OUT_DIR, f))
  }
  for (const f of fs.readdirSync(RIS_OUT_DIR)) {
    if (f.endsWith('.ris')) fs.unlinkSync(path.join(RIS_OUT_DIR, f))
  }

  for (const e of entries) {
    if (!e?.key) continue
    writeEntry(e)
  }

  console.log(`Generated ${entries.length} publication markdown files into ${OUT_DIR}`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}
