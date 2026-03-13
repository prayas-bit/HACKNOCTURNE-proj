/**
 * Objective 1 — Data Contract
 * The shared JSON schema that defines the structure every part of the system
 * reads and writes. Import this in the Vite plugin, the parser, the watcher
 * server, and the dashboard UI so all four stay in sync.
 *
 * File: core-server/src/schema.js
 */

// ─── Master schema (JSON Schema draft-07) ─────────────────────────────────────
export const COVERAGE_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'coverage-report',
  title: 'Coverage Report',
  type: 'object',
  required: ['version', 'generatedAt', 'summary', 'files'],
  properties: {

    version: {
      type: 'string',
      description: 'Schema version — bump when the shape changes.',
      const: '1.0.0',
    },

    generatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'ISO-8601 timestamp of when this report was produced.',
    },

    summary: {
      type: 'object',
      description: 'Aggregate metrics across all files.',
      required: ['lines', 'statements', 'functions', 'branches'],
      properties: {
        lines:      { $ref: '#/definitions/metric' },
        statements: { $ref: '#/definitions/metric' },
        functions:  { $ref: '#/definitions/metric' },
        branches:   { $ref: '#/definitions/metric' },
      },
    },

    files: {
      type: 'array',
      description: 'Per-file coverage entries.',
      items: { $ref: '#/definitions/fileEntry' },
    },
  },

  definitions: {
    metric: {
      type: 'object',
      required: ['total', 'covered', 'pct'],
      properties: {
        total:   { type: 'integer', minimum: 0 },
        covered: { type: 'integer', minimum: 0 },
        pct:     { type: 'number',  minimum: 0, maximum: 100 },
      },
    },

    fileEntry: {
      type: 'object',
      required: ['path', 'lines', 'statements', 'functions', 'branches', 'score'],
      properties: {
        path: {
          type: 'string',
          description: 'Project-relative POSIX path, e.g. "src/components/Button.tsx".',
        },
        lines:      { $ref: '#/definitions/metric' },
        statements: { $ref: '#/definitions/metric' },
        functions:  { $ref: '#/definitions/metric' },
        branches:   { $ref: '#/definitions/metric' },
        score: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Weighted composite score: lines×0.4 + statements×0.25 + functions×0.2 + branches×0.15.',
        },
        uncoveredLines: {
          type: 'array',
          items: { type: 'integer' },
          description: 'Line numbers with zero hits (from lcov DA records).',
        },
      },
    },
  },
}

// ─── TypeScript-style type definitions (JSDoc) ────────────────────────────────
/**
 * @typedef {{ total: number, covered: number, pct: number }} Metric
 *
 * @typedef {{
 *   path: string,
 *   lines: Metric,
 *   statements: Metric,
 *   functions: Metric,
 *   branches: Metric,
 *   score: number,
 *   uncoveredLines?: number[],
 * }} FileEntry
 *
 * @typedef {{
 *   version: '1.0.0',
 *   generatedAt: string,
 *   summary: { lines: Metric, statements: Metric, functions: Metric, branches: Metric },
 *   files: FileEntry[],
 * }} CoverageReport
 */

// ─── Factory helpers (used by both the lcov parser and the jest adapter) ──────
export function makeMetric(total = 0, covered = 0) {
  return {
    total,
    covered,
    pct: total === 0 ? 100 : Math.round((covered / total) * 1000) / 10,
  }
}

export function makeScore({ lines, statements, functions, branches }) {
  return (
    Math.round(
      (lines.pct * 0.4 +
        statements.pct * 0.25 +
        functions.pct * 0.2 +
        branches.pct * 0.15) *
        10
    ) / 10
  )
}

/** Compute summary metrics by summing all file entries. */
export function summarise(files) {
  const sum = (key) => {
    const total   = files.reduce((n, f) => n + f[key].total, 0)
    const covered = files.reduce((n, f) => n + f[key].covered, 0)
    return makeMetric(total, covered)
  }
  return {
    lines:      sum('lines'),
    statements: sum('statements'),
    functions:  sum('functions'),
    branches:   sum('branches'),
  }
}

/** Build a complete, schema-valid CoverageReport object. */
export function makeCoverageReport(files) {
  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    summary: summarise(files),
    files,
  }
}