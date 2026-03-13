import path from "path";
import fs from "fs";

export interface CoverageSummary {
  [filePath: string]: {
    lines: { pct: number };
    statements: { pct: number };
    functions: { pct: number };
    branches: { pct: number };
  };
}

export interface BlastRadiusResult {
  targetFile: string;
  impacted_pages: string[];
  vulnerable_files: string[];
  vulnerable_count: number;
  total_reach: number;
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  dependency_chain: Array<{
    file: string;
    coverage: number;
    depth: number;
    dependents: string[];
  }>;
  coverage_map: Record<string, number>;
}

const IMPORT_REGEX =
  /(?:import\s+(?:.+?\s+from\s+)?['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;

function collectSourceFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      results.push(...collectSourceFiles(fullPath));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractImports(filePath: string): string[] {
  let src: string;
  try {
    src = fs.readFileSync(filePath, "utf-8");
  } catch {
    return [];
  }
  const imports: string[] = [];
  let match: RegExpExecArray | null;
  IMPORT_REGEX.lastIndex = 0;
  while ((match = IMPORT_REGEX.exec(src)) !== null) {
    const imp = match[1] ?? match[2];
    if (imp && imp.startsWith(".")) imports.push(imp);
  }
  return imports;
}

function resolveImport(fromFile: string, importPath: string): string | null {
  const dir = path.dirname(fromFile);
  const base = path.resolve(dir, importPath);
  const extensions = [
    "",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    "/index.ts",
    "/index.tsx",
    "/index.js",
    "/index.jsx",
  ];
  for (const ext of extensions) {
    const candidate = base + ext;
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function buildReverseDependencyMap(srcDir: string): Map<string, Set<string>> {
  const files = collectSourceFiles(srcDir);
  const reverseDeps = new Map<string, Set<string>>();
  for (const f of files) {
    if (!reverseDeps.has(f)) reverseDeps.set(f, new Set());
  }
  for (const file of files) {
    const imports = extractImports(file);
    for (const imp of imports) {
      const resolved = resolveImport(file, imp);
      if (resolved) {
        if (!reverseDeps.has(resolved)) reverseDeps.set(resolved, new Set());
        reverseDeps.get(resolved)!.add(file);
      }
    }
  }
  return reverseDeps;
}

function findAllDependents(
  targetFile: string,
  reverseDeps: Map<string, Set<string>>,
): Set<string> {
  const visited = new Set<string>();
  const queue = [targetFile];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const parents = reverseDeps.get(current) ?? new Set();
    for (const parent of parents) {
      if (!visited.has(parent)) {
        visited.add(parent);
        queue.push(parent);
      }
    }
  }
  return visited;
}

function loadCoverage(coveragePath: string): Record<string, any> {
  if (!fs.existsSync(coveragePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(coveragePath, "utf-8"));
  } catch {
    return {};
  }
}

function buildCoverageMap(
  summary: Record<string, any>,
  cwd: string,
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const [key, data] of Object.entries(summary)) {
    if (key === "total") continue;
    const absKey = path.isAbsolute(key) ? key : path.resolve(cwd, key);
    map[absKey] = data.lines?.pct ?? 0;
  }
  return map;
}

function calculateRisk(dependentCount: number, coveragePct: number): number {
  return Math.round(dependentCount * (100 - coveragePct));
}

function getRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score === 0) return "low";
  if (score < 300) return "medium";
  if (score < 800) return "high";
  return "critical";
}

const PAGE_PATH_RE = /[/\\](pages?|routes?|views?)[/\\]/i;
const PAGE_NAME_RE = /(Page|View|Screen|Route)\.(tsx?|jsx?)$/;

function isPage(filePath: string): boolean {
  return PAGE_PATH_RE.test(filePath) || PAGE_NAME_RE.test(filePath);
}

export interface AnalyseOptions {
  projectRoot: string;
  srcDir?: string;
  coverageFile?: string;
}

export function analyseBlastRadius(
  targetFile: string,
  opts: AnalyseOptions,
): BlastRadiusResult {
  const { projectRoot } = opts;
  const srcDir = opts.srcDir ?? path.join(projectRoot, "src");
  const coverageFile =
    opts.coverageFile ??
    path.join(projectRoot, "coverage", "coverage-summary.json");

  const absTarget = path.isAbsolute(targetFile)
    ? targetFile
    : path.resolve(projectRoot, targetFile);

  const reverseDeps = buildReverseDependencyMap(srcDir);
  const allDependents = findAllDependents(absTarget, reverseDeps);
  const rawCoverage = loadCoverage(coverageFile);
  const coverageMap = buildCoverageMap(rawCoverage, projectRoot);

  const impactedPages = [...allDependents].filter(isPage);
  const vulnerableFiles = [...allDependents].filter(
    (f) => (coverageMap[f] ?? 0) === 0,
  );
  const targetCoverage = coverageMap[absTarget] ?? 0;
  const riskScore = calculateRisk(allDependents.size, targetCoverage);

  const chain: Array<{
    file: string;
    coverage: number;
    depth: number;
    dependents: string[];
  }> = [];
  const visited = new Set<string>();
  const bfsQueue: Array<{ file: string; depth: number }> = [
    { file: absTarget, depth: 0 },
  ];

  while (bfsQueue.length > 0) {
    const { file, depth } = bfsQueue.shift()!;
    if (visited.has(file)) continue;
    visited.add(file);
    const parents = [...(reverseDeps.get(file) ?? [])];
    chain.push({
      file: path.relative(projectRoot, file),
      coverage: coverageMap[file] ?? 0,
      depth,
      dependents: parents.map((p) => path.relative(projectRoot, p)),
    });
    for (const parent of parents) {
      if (!visited.has(parent))
        bfsQueue.push({ file: parent, depth: depth + 1 });
    }
  }

  const relativeCoverageMap: Record<string, number> = {};
  for (const dep of allDependents) {
    relativeCoverageMap[path.relative(projectRoot, dep)] =
      coverageMap[dep] ?? 0;
  }

  return {
    targetFile: path.relative(projectRoot, absTarget),
    impacted_pages: impactedPages.map((f) => path.relative(projectRoot, f)),
    vulnerable_files: vulnerableFiles.map((f) => path.relative(projectRoot, f)),
    vulnerable_count: vulnerableFiles.length,
    total_reach: allDependents.size,
    risk_score: riskScore,
    risk_level: getRiskLevel(riskScore),
    dependency_chain: chain,
    coverage_map: relativeCoverageMap,
  };
}
