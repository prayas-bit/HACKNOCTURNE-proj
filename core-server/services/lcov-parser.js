import { readFile, writeFile } from 'node:fs/promises'
import { existsSync }           from 'node:fs'
import path                     from 'node:path'
import { makeMetric, makeScore, makeCoverageReport } from './schema.js'

export function parseLcov(lcovText, rootDir = process.cwd()) {
  const files = []
  let current = null

  const testsDir = path.resolve(rootDir, 'src/__tests__')

  for (const rawLine of lcovText.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith('SF:')) {
      const rawPath = line.slice(3).trim()

      let relPath
      if (path.isAbsolute(rawPath)) {
        relPath = path.relative(rootDir, rawPath).replace(/\\/g, '/')
        if (relPath.startsWith('..')) {
          const srcIndex = rawPath.indexOf('src/')
          relPath = srcIndex !== -1 ? rawPath.slice(srcIndex).replace(/\\/g, '/') : null
        }
      } else {
        relPath = rawPath.replace(/\\/g, '/')
      }

      if (!relPath) {
        current = null
        continue
      }

      const fileName = path.basename(relPath, path.extname(relPath))
      const testPath = path.join(testsDir, `${fileName}.test.jsx`)

      if (!existsSync(testPath)) {
        console.log(`[lcov-parser] filtering out ${relPath} (no test file)`)
        current = null
        continue
      }

      current = {
        path:            relPath,
        _linesTotal:     0,
        _linesCovered:   0,
        _fnTotal:        0,
        _fnCovered:      0,
        _brTotal:        0,
        _brCovered:      0,
        _uncoveredLines: [],
      }
      continue
    }

    if (!current) continue

    if (line.startsWith('DA:')) {
      const parts  = line.slice(3).split(',')
      const lineNo = parseInt(parts[0], 10)
      const hits   = parseInt(parts[1], 10)
      current._linesTotal++
      if (hits > 0) {
        current._linesCovered++
      } else {
        current._uncoveredLines.push(lineNo)
      }
      continue
    }

    if (line.startsWith('LF:'))  { current._linesTotal   = parseInt(line.slice(3), 10); continue }
    if (line.startsWith('LH:'))  { current._linesCovered = parseInt(line.slice(3), 10); continue }
    if (line.startsWith('FNF:')) { current._fnTotal      = parseInt(line.slice(4), 10); continue }
    if (line.startsWith('FNH:')) { current._fnCovered    = parseInt(line.slice(4), 10); continue }
    if (line.startsWith('BRF:')) { current._brTotal      = parseInt(line.slice(4), 10); continue }
    if (line.startsWith('BRH:')) { current._brCovered    = parseInt(line.slice(4), 10); continue }

    if (line === 'end_of_record') {
      const lines      = makeMetric(current._linesTotal,   current._linesCovered)
      const statements = makeMetric(current._linesTotal,   current._linesCovered)
      const functions  = makeMetric(current._fnTotal,      current._fnCovered)
      const branches   = makeMetric(current._brTotal,      current._brCovered)

      files.push({
        path:           current.path,
        lines,
        statements,
        functions,
        branches,
        score:          makeScore({ lines, statements, functions, branches }),
        uncoveredLines: current._uncoveredLines,
      })

      current = null
    }
  }

  return files
}

export async function lcovFileToReport(lcovPath, rootDir = process.cwd()) {
  if (!existsSync(lcovPath)) {
    throw new Error(`lcov file not found: ${lcovPath}`)
  }
  const text  = await readFile(lcovPath, 'utf-8')
  const files = parseLcov(text, rootDir)
  return makeCoverageReport(files)
}

async function main() {
  const args = process.argv.slice(2)
  const get  = (flag) => {
    const i = args.indexOf(flag)
    return i !== -1 ? args[i + 1] : null
  }

  const inputPath  = get('--input')  ?? path.resolve(process.cwd(), 'coverage/lcov.info')
  const outputPath = get('--output') ?? path.resolve(process.cwd(), 'coverage/report.json')
  const rootDir    = get('--root')   ?? process.cwd()

  console.log(`[lcov-parser] processing: ${inputPath}`)

  try {
    const report = await lcovFileToReport(inputPath, rootDir)
    await writeFile(outputPath, JSON.stringify(report, null, 2), 'utf-8')
    console.log(`[lcov-parser] written to: ${outputPath}`)
    console.log(`[lcov-parser] files: ${report.files.length}`)
  } catch (err) {
    console.error(`[lcov-parser] error: ${err.message}`)
  }
}

if (process.argv[1] && process.argv[1].endsWith('lcov-parser.js')) {
  main()
}