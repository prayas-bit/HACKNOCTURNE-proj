import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

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
      if (!id.endsWith('.jsx')) return null
      if (id.includes('node_modules')) return null
      return transformCode(code, id, { rootDir, attributeName, includeLineNum })
    },
  }
}

export default viteSourcePathPlugin

export function transformCode(code, filename, options = {}) {
  const {
    rootDir        = process.cwd(),
    attributeName  = 'data-source-path',
    includeLineNum = true,
  } = options

  let transformSync
  try {
    const projectRequire = createRequire(path.join(process.cwd(), 'package.json'))
    transformSync = projectRequire('@babel/core').transformSync
  } catch {
    console.warn('[source-path-plugin] @babel/core not found in project — skipping transform')
    return null
  }

  const result = transformSync(code, {
    filename,
    configFile:  false,
    babelrc:     false,
    retainLines: true,
    sourceMaps:  true,
    parserOpts: {
      plugins: ['jsx'],
    },
    plugins: [
      babelVisitorPlugin({ rootDir, attributeName, includeLineNum }),
    ],
  })

  return result ? { code: result.code, map: result.map } : null
}

function babelVisitorPlugin({ rootDir, attributeName, includeLineNum }) {
  return function ({ types: t }) {
    return {
      name: 'babel-source-path',
      visitor: {
        JSXOpeningElement(nodePath, state) {
          // Skip if parent JSXElement's parent is also a JSXElement
          // This ensures we only tag the ROOT element of each component
          const jsxElementPath = nodePath.parentPath
          if (
            jsxElementPath.parent.type === 'JSXElement' ||
            jsxElementPath.parent.type === 'JSXFragment'
          ) return

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