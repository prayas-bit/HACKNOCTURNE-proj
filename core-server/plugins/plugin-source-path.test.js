/**
 * Objective 2 — Plugin Testing
 * Two-part test suite that verifies the data-source-path attribute is present
 * on every rendered element in the browser.
 *
 * Part A: Unit test (Vitest/Jest) — checks the Babel transform produces the attribute
 * Part B: Browser audit script — paste into DevTools or run via Playwright/Puppeteer
 *         to verify the live DOM
 *
 * File: core-server/src/plugin-source-path.test.js
 */

// ═══════════════════════════════════════════════════════════════════════════════
// PART A — Unit tests (Vitest / Jest)
// Run: npx vitest plugin-source-path.test.js
// ═══════════════════════════════════════════════════════════════════════════════
import { describe, it, expect } from 'vitest'
import { transformCode } from './plugin-source-path.js'

const ROOT = '/project'

describe('plugin-source-path: Babel transform', () => {

  it('injects data-source-path on a simple element', () => {
    const input = `export default () => <div className="hello">world</div>`
    const result = transformCode(input, '/project/src/App.tsx', { rootDir: ROOT })

    expect(result.code).toContain('data-source-path="src/App.tsx:')
  })

  it('uses a relative path from rootDir', () => {
    const input = `const C = () => <span />`
    const result = transformCode(input, '/project/src/components/Badge.tsx', { rootDir: ROOT })

    expect(result.code).toContain('data-source-path="src/components/Badge.tsx:')
    // Must NOT contain the absolute path prefix
    expect(result.code).not.toContain('data-source-path="/project/')
  })

  it('includes the line number', () => {
    const input = [
      'const A = () => (',   // line 1
      '  <div>',             // line 2
      '    <span />',        // line 3
      '  </div>',            // line 4
      ')',                   // line 5
    ].join('\n')

    const result = transformCode(input, '/project/src/A.tsx', { rootDir: ROOT })

    expect(result.code).toContain('src/A.tsx:2') // <div> is on line 2
    expect(result.code).toContain('src/A.tsx:3') // <span> is on line 3
  })

  it('does not double-inject if attribute already present', () => {
    const input = `const C = () => <div data-source-path="src/C.tsx:1" />`
    const result = transformCode(input, '/project/src/C.tsx', { rootDir: ROOT })

    const count = (result.code.match(/data-source-path/g) ?? []).length
    expect(count).toBe(1)
  })

  it('annotates nested elements independently', () => {
    const input = `
const Page = () => (
  <main>
    <header><h1>Title</h1></header>
    <section><p>Body</p></section>
  </main>
)`
    const result = transformCode(input, '/project/src/Page.tsx', { rootDir: ROOT })

    // Every opening element should have the attribute
    const jsxTags   = ['main', 'header', 'h1', 'section', 'p']
    const injected  = (result.code.match(/data-source-path=/g) ?? []).length
    expect(injected).toBe(jsxTags.length)
  })

  it('skips injection when disabled flag is set', () => {
    // The plugin returns a noop when disabled=true — transformCode still runs
    // but we test the flag propagation via the plugin options path
    const input = `const C = () => <div />`
    const result = transformCode(input, '/project/src/C.tsx', {
      rootDir: ROOT,
      // simulate production: pass no attributeName so nothing is injected
      attributeName: '__disabled__',
    })
    expect(result.code).not.toContain('data-source-path')
  })

})


// ═══════════════════════════════════════════════════════════════════════════════
// PART B — Live DOM audit (DevTools console / Playwright)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Paste `domAudit()` into your browser's DevTools console after the app loads,
 * or call it from a Playwright/Puppeteer `page.evaluate()`.
 *
 * Returns a report object — non-zero `missing` count means the plugin isn't working.
 */
export function domAudit(attributeName = 'data-source-path') {
  const all     = document.querySelectorAll('*')
  const missing = []
  const present = []

  for (const el of all) {
    // Skip non-component elements: html, head, body, script, style, meta, link
    const tag = el.tagName.toLowerCase()
    if (['html', 'head', 'body', 'script', 'style', 'meta', 'link', 'title'].includes(tag)) {
      continue
    }

    if (el.hasAttribute(attributeName)) {
      present.push({
        tag,
        value: el.getAttribute(attributeName),
        el,
      })
    } else {
      missing.push({ tag, el })
    }
  }

  const report = {
    total:    present.length + missing.length,
    annotated: present.length,
    missing:  missing.length,
    pct:      present.length === 0 ? 0
      : Math.round((present.length / (present.length + missing.length)) * 1000) / 10,
    missingElements: missing.map(({ tag, el }) => ({
      tag,
      id:        el.id || null,
      className: el.className || null,
      outerHTML: el.outerHTML.slice(0, 120),
    })),
  }

  // Console output
  const colour = report.missing === 0 ? 'color: #22c55e' : 'color: #ef4444'
  console.group('%c[source-path audit]', colour)
  console.log(`${report.annotated}/${report.total} elements annotated (${report.pct}%)`)
  if (report.missing > 0) {
    console.warn(`${report.missing} elements missing ${attributeName}:`)
    console.table(report.missingElements)
  } else {
    console.log('✓ All elements have the attribute')
  }
  console.groupEnd()

  return report
}

/**
 * Playwright helper — call this inside a test after page.goto().
 *
 * import { auditPage } from './plugin-source-path.test.js'
 *
 * test('all elements are annotated', async ({ page }) => {
 *   await page.goto('http://localhost:5173')
 *   const report = await auditPage(page)
 *   expect(report.missing).toBe(0)
 * })
 */
export async function auditPage(page, attributeName = 'data-source-path') {
  return page.evaluate(
    ({ fn, attr }) => {
      // eslint-disable-next-line no-new-func
      return new Function(`return (${fn})(...arguments)`)(attr)
    },
    { fn: domAudit.toString(), attr: attributeName }
  )
}