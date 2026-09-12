import { execFileSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import ejs from 'ejs'
import yaml from 'js-yaml'

const ROOT = process.cwd()
const CV_YAML = path.join(ROOT, 'data', 'cv.yaml')
const TEMPLATE = path.join(ROOT, 'src/templates', 'cv.tex.ejs')

const OUT_DIR = path.join(ROOT, 'build', 'cv')
const OUT_TEX = path.join(OUT_DIR, 'cv.tex')
const OUT_PDF = path.join(OUT_DIR, 'cv.pdf')
const INPUT_HASH_FILE = path.join(OUT_DIR, '.input-hash')

const PUBLIC_PDF = path.join(ROOT, 'public', 'cv.pdf')

// Where Awesome-CV lives in your repo
const AWESOME_DIR = path.join(ROOT, 'latex', 'awesome-cv')
const AWESOME_CLS = path.join(AWESOME_DIR, 'awesome-cv.cls')

// The PDF footer uses \today and XeLaTeX/xdvipdfmx embed a build timestamp, so
// recompiling on unchanged inputs still produces a different binary. Skip the
// (slow) latexmk run entirely when nothing that affects the output has changed,
// so `npm run dev`/`build` don't dirty public/cv.pdf every time they run.
function computeInputHash() {
  const hash = crypto.createHash('sha256')
  hash.update(fs.readFileSync(CV_YAML))
  hash.update(fs.readFileSync(TEMPLATE))
  for (const file of fs.readdirSync(AWESOME_DIR).sort()) {
    const filePath = path.join(AWESOME_DIR, file)
    if (fs.statSync(filePath).isFile()) {
      hash.update(file)
      hash.update(fs.readFileSync(filePath))
    }
  }
  return hash.digest('hex')
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function removeIfExists(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { force: true })
}

function escapeLatex(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[{}]/g, (m) => (m === '{' ? '\\{' : '\\}'))
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\^/g, '\\^{}')
}

function sanitizeForLatex(x) {
  if (Array.isArray(x)) return x.map(sanitizeForLatex)
  if (x && typeof x === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(x)) out[k] = sanitizeForLatex(v)
    return out
  }
  if (typeof x === 'string') return escapeLatex(x)
  return x
}

function run(cmd, args, options = {}) {
  execFileSync(cmd, args, { stdio: 'inherit', ...options })
}

function main() {
  if (!fs.existsSync(CV_YAML)) throw new Error(`Missing ${CV_YAML}`)
  if (!fs.existsSync(TEMPLATE)) throw new Error(`Missing ${TEMPLATE}`)
  if (!fs.existsSync(AWESOME_CLS)) {
    throw new Error(
      `Awesome-CV not found at ${AWESOME_CLS}. Add it under latex/awesome-cv (submodule or copy).`
    )
  }

  ensureDir(OUT_DIR)

  const inputHash = computeInputHash()
  const previousHash = fs.existsSync(INPUT_HASH_FILE) ? fs.readFileSync(INPUT_HASH_FILE, 'utf8').trim() : null

  if (inputHash === previousHash && fs.existsSync(PUBLIC_PDF)) {
    console.log('CV PDF up to date, skipping regeneration')
    return
  }

  // Clean stale LaTeX artifacts so template changes do not leave incompatible aux state behind.
  for (const suffix of [
    '.aux',
    '.bbl',
    '.bcf',
    '.blg',
    '.fdb_latexmk',
    '.fls',
    '.log',
    '.out',
    '.run.xml',
    '.xdv',
    '.pdf'
  ]) {
    removeIfExists(path.join(OUT_DIR, `cv${suffix}`))
    removeIfExists(path.join(OUT_DIR, `cv${suffix}-SAVE-ERROR`))
  }

  // Load YAML
  const cvRaw = yaml.load(fs.readFileSync(CV_YAML, 'utf8'))

  // The web CV links to full profile URLs, but Awesome-CV's \orcid and
  // \googlescholar macros take bare IDs (they build the URL themselves), so
  // derive those from the URLs stored in cv.yaml.
  if (cvRaw.basics?.orcid) {
    const match = /orcid\.org\/([^/?#]+)/.exec(cvRaw.basics.orcid)
    cvRaw.basics.orcid_id = match ? match[1] : cvRaw.basics.orcid
  }
  if (cvRaw.basics?.scholar) {
    const match = /[?&]user=([^&#]+)/.exec(cvRaw.basics.scholar)
    if (match) cvRaw.basics.scholar_id = match[1]
  }

  const cv = sanitizeForLatex(cvRaw)

  // Render TeX. Keep the emitted structure close to the original resume sources
  // so Awesome-CV spacing stays predictable, but strip EJS-introduced blank
  // lines inside entry bodies because they change LaTeX paragraph spacing.
  let tex = ejs.render(fs.readFileSync(TEMPLATE, 'utf8'), { cv }, { async: false })

  tex = tex.replace(/[\t ]+\n/g, '\n')
  tex = tex.replace(/\n[ \t]*\n[ \t]*\n+/g, '\n\n')
  tex = tex.replace(/(\{\n)(?:[ \t]*\n)+/g, '$1')
  tex = tex.replace(/(?:\n[ \t]*)+(\s*\})/g, '\n$1')
  tex = tex.replace(/(\\begin\{cvitems\}\n)(?:[ \t]*\n)+/g, '$1')
  tex = tex.replace(/(?:\n[ \t]*)+(\\end\{cvitems\})/g, '\n$1')
  tex = tex.replace(/(\\item \{[^\n]*\})(?:\n[ \t]*){2,}/g, '$1\n')

  fs.writeFileSync(OUT_TEX, tex, 'utf8')

  // Compile with latexmk
  // We add TEXINPUTS so TeX can find awesome-cv.cls
  const env = {
    ...process.env,
    TEXINPUTS: `${AWESOME_DIR}${path.delimiter}${process.env.TEXINPUTS || ''}`
  }

  // latexmk requires a TeX Live install, which isn't available on every build
  // environment (e.g. Netlify preview builds). Fall back to whatever cv.pdf is
  // already committed rather than failing the whole site build.
  try {
    run(
      'latexmk',
      [
        '-xelatex',
        '-interaction=nonstopmode',
        '-halt-on-error',
        `-outdir=${OUT_DIR}`,
        OUT_TEX
      ],
      { env }
    )
  } catch (err) {
    if (err.code === 'ENOENT' && fs.existsSync(PUBLIC_PDF)) {
      console.warn('latexmk not found; keeping existing public/cv.pdf as-is')
      return
    }
    throw err
  }

  if (!fs.existsSync(OUT_PDF)) throw new Error('PDF was not produced by latexmk.')

  // Copy to public/ so Astro serves it
  ensureDir(path.dirname(PUBLIC_PDF))
  fs.copyFileSync(OUT_PDF, PUBLIC_PDF)
  fs.writeFileSync(INPUT_HASH_FILE, inputHash, 'utf8')
  console.log(`CV PDF updated: ${path.relative(ROOT, PUBLIC_PDF)}`)
}

main()
