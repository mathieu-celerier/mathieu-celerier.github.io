// @ts-check
import katex from 'katex'

const escapeHtml = (/** @type {string} */ s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Render one TeX expression to KaTeX HTML with MathML for screen readers.
 * Throws on invalid TeX so a typo fails the build instead of shipping raw source.
 * @param {string} expr @param {{ display?: boolean }} [options]
 */
export function renderTex(expr, { display = false } = {}) {
  return katex.renderToString(expr, {
    displayMode: display,
    throwOnError: true,
    strict: 'error',
    output: 'htmlAndMathml'
  })
}

/**
 * Render prose containing `$…$` inline math; everything outside the delimiters is HTML-escaped.
 * A literal dollar sign is written `\$`.
 * @param {string} text
 */
export function renderInline(text) {
  let html = ''
  let rest = text
  for (;;) {
    const open = findDelimiter(rest, 0)
    if (open < 0) break
    const close = findDelimiter(rest, open + 1)
    if (close < 0) throw new Error(`Unclosed $ in: ${text}`)
    html += escapeHtml(unescapeDollar(rest.slice(0, open))) + renderTex(rest.slice(open + 1, close))
    rest = rest.slice(close + 1)
  }
  return html + escapeHtml(unescapeDollar(rest))
}

/** @param {string} s @param {number} from */
function findDelimiter(s, from) {
  for (let i = from; i < s.length; i++) {
    if (s[i] === '\\') i++
    else if (s[i] === '$') return i
  }
  return -1
}

const unescapeDollar = (/** @type {string} */ s) => s.replace(/\\\$/g, '$')
