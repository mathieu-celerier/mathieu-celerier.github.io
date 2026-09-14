import assert from 'node:assert/strict'
import test from 'node:test'

import { renderInline, renderTex } from '../src/lib/tex.js'

test('renders TeX with both HTML and MathML output', () => {
  const html = renderTex('\\Gamma_k \\Lambda_k^{-1}')
  assert.match(html, /class="katex"/)
  assert.match(html, /<math/)
})

test('display mode wraps the expression in a display block', () => {
  assert.match(renderTex('x', { display: true }), /katex-display/)
})

test('invalid TeX fails loudly', () => {
  assert.throws(() => renderTex('\\frac{1}'))
  assert.throws(() => renderTex('\\notacommand'))
})

test('inline prose escapes text outside math and renders each $…$ segment', () => {
  const html = renderInline('a <b> & $\\alpha$ then $\\beta$')
  assert.ok(html.startsWith('a &lt;b&gt; &amp; '))
  assert.equal((html.match(/class="katex"/g) || []).length, 2)
})

test('escaped dollars stay literal and unclosed math throws', () => {
  assert.equal(renderInline('costs \\$5'), 'costs $5')
  assert.throws(() => renderInline('open $x'))
})
