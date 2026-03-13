/**
 * Objective 1 (continued) — Vite Plugin: data-source-path injection
 * File: core-server/src/plugin-source-path.js
 *
 * Transforms every .jsx/.tsx file at build time, inserting
 *   data-source-path="src/components/Button.tsx:42"
 * as the first attribute on every JSX opening element.
 *
 * Usage in vite.config.ts:
 *   import { viteSourcePathPlugin } from './plugin-source-path'
 *   export default { plugins: [viteSourcePathPlugin()] }
 */

import path from 'node:path'

// ─── Vite plugin wrapper ──────────────────────────────────────────────────────
export function viteSourcePathPlugin(options = {}) {
  const {
    rootDir        = process.cwd(),
    attributeName  = 'data-source-path',
    includeLineNum = true,
    disabled       = process.env.NODE_ENV === 'production',
  } = options

  if (disabled) {
    return { name: 'vite-plugin-source-path-noop' }
  }

  return {
    name: 'vite-plugin-source-path',
    enforce: 'pre',

    transform(code, id) {
      if (!/\.[jt]sx$/.test(id)) return null
      if (id.includes('node_modules')) return null
      return transformCode(code, id, { rootDir, attributeName, includeLineNum })
    },
  }
}

export default viteSourcePathPlugin

// ─── Core transform ───────────────────────────────────────────────────────────
export function transformCode(code, filename, options = {}) {
  const {
    rootDir       = process.cwd(),
    attributeName = 'data-source-path',
    includeLineNum = true,
  } = options

  let transformSync
  try {
    ;({ transformSync } = require('@babel/core'))
  } catch {
    console.warn('[source-path-plugin] @babel/core not found — skipping transform')
    return null
  }

  const result = transformSync(code, {
    filename,
    configFile:  false,
    babelrc:     false,
    retainLines: true,
    sourceMaps:  true,
    plugins: [
      require('@babel/plugin-syntax-jsx'),
      require('@babel/plugin-syntax-typescript').default ?? require('@babel/plugin-syntax-typescript'),
      babelVisitorPlugin({ rootDir, attributeName, includeLineNum }),
    ],
  })

  return result ? { code: result.code, map: result.map } : null
}

// ─── Babel visitor factory ────────────────────────────────────────────────────
function babelVisitorPlugin({ rootDir, attributeName, includeLineNum }) {
  return function ({ types: t }) {
    return {
      name: 'babel-source-path',
      visitor: {
        JSXOpeningElement(nodePath, state) {
          const filename = state.filename || 'unknown'
          const rel = path.relative(rootDir, filename).replace(/\\/g, '/')

          const already = nodePath.node.attributes.some(
            (a) => t.isJSXAttribute(a) && a.name.name === attributeName
          )
          if (already) return

          const loc   = nodePath.node.loc
          const line  = loc?.start?.line ?? '?'
          const value = includeLineNum ? `${rel}:${line}` : rel

          nodePath.node.attributes.unshift(
            t.jSXAttribute(t.jSXIdentifier(attributeName), t.stringLiteral(value))
          )
        },
      },
    }
  }
}