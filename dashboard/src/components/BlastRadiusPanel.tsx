import React, { useEffect, useState, useCallback } from "react";

interface DependencyNode {
  file: string;
  coverage: number;
  depth: number;
  dependents: string[];
}

interface BlastRadiusResult {
  targetFile: string;
  impacted_pages: string[];
  vulnerable_files: string[];
  vulnerable_count: number;
  total_reach: number;
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  dependency_chain: DependencyNode[];
  coverage_map: Record<string, number>;
}

const RISK_COLORS = {
  low: "#4caf50",
  medium: "#ff9800",
  high: "#f44336",
  critical: "#b71c1c",
};

const RISK_ICONS = {
  low: "✅",
  medium: "⚠️",
  high: "🔥",
  critical: "💥",
};

function MetricCard({
  value,
  label,
  color,
}: {
  value: number | string;
  label: string;
  color?: string;
}) {
  return (
    <div style={styles.metricCard}>
      <div style={{ ...styles.metricValue, color: color ?? "#fff" }}>
        {value}
      </div>
      <div style={styles.metricLabel}>{label}</div>
    </div>
  );
}

function CoverageBar({ pct }: { pct: number }) {
  const color = pct === 0 ? "#f44336" : pct < 50 ? "#ff9800" : "#4caf50";
  return (
    <div style={styles.coverageBarTrack}>
      <div
        style={{
          ...styles.coverageBarFill,
          width: `${pct}%`,
          background: color,
        }}
      />
      <span style={styles.coverageBarLabel}>{pct}%</span>
    </div>
  );
}

function WarningBanner({ data }: { data: BlastRadiusResult }) {
  if (data.risk_level === "low" || data.risk_level === "medium") return null;
  const fileName = data.targetFile.split("/").pop() ?? data.targetFile;
  return (
    <div
      style={{
        ...styles.warningBanner,
        borderColor: RISK_COLORS[data.risk_level],
      }}
    >
      <div style={styles.warningIcon}>{RISK_ICONS[data.risk_level]}</div>
      <div>
        <div style={styles.warningTitle}>
          {data.risk_level === "critical" ? "Critical" : "High"} Blast Radius
          Detected
        </div>
        <div style={styles.warningBody}>
          You are editing <code style={styles.code}>{fileName}</code>. This
          impacts <strong>{data.total_reach}</strong> components.{" "}
          <strong style={{ color: "#f44336" }}>{data.vulnerable_count}</strong>{" "}
          components have no test coverage and are currently <em>"blind"</em> to
          your changes.
        </div>
      </div>
    </div>
  );
}

function DependencyChainTable({ chain }: { chain: DependencyNode[] }) {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? chain : chain.slice(0, 10);
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>Dependency Chain</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>File</th>
            <th style={styles.th}>Depth</th>
            <th style={styles.th}>Coverage</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((node, i) => (
            <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
              <td
                style={{
                  ...styles.td,
                  paddingLeft: `${8 + node.depth * 16}px`,
                }}
              >
                <span
                  style={
                    node.coverage === 0
                      ? styles.fileNameUncovered
                      : styles.fileName
                  }
                >
                  {node.coverage === 0 && "❌ "}
                  {node.file}
                </span>
              </td>
              <td style={{ ...styles.td, textAlign: "center", opacity: 0.6 }}>
                {node.depth}
              </td>
              <td style={{ ...styles.td, minWidth: 120 }}>
                <CoverageBar pct={node.coverage} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {chain.length > 10 && (
        <button style={styles.expandBtn} onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Show less" : `Show all ${chain.length} nodes`}
        </button>
      )}
    </div>
  );
}

interface BlastRadiusPanelProps {
  serverUrl?: string;
  filePath?: string;
  projectRoot?: string;
}

function BlastRadiusPanel({
  serverUrl = "http://localhost:3000",
  filePath: initialFile,
  projectRoot = "",
}: BlastRadiusPanelProps) {
  const [filePath, setFilePath] = useState(initialFile ?? "");
  const [data, setData] = useState<BlastRadiusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (file: string) => {
      if (!file) return;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ file });
        if (projectRoot) params.set("root", projectRoot);
        const res = await fetch(`${serverUrl}/api/blast-radius?${params}`);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        setData(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [serverUrl, projectRoot],
  );

  // NEW: Auto-fill from URL parameter (for Chrome extension integration)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fileFromUrl = urlParams.get("file");

    if (fileFromUrl && !initialFile) {
      setFilePath(fileFromUrl);
      fetchData(fileFromUrl);
    }
  }, [initialFile, fetchData]);

  // Handle initialFile prop
  useEffect(() => {
    if (initialFile) fetchData(initialFile);
  }, [initialFile, fetchData]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>💥 Blast Radius Analyzer</h2>
        <p style={styles.headerSub}>
          Understand how many components are affected when you change a file
        </p>
      </div>

      {!initialFile && (
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="src/components/Button.tsx"
            onKeyDown={(e) => e.key === "Enter" && fetchData(filePath)}
          />
          <button
            style={styles.analyseBtn}
            onClick={() => fetchData(filePath)}
            disabled={loading || !filePath}
          >
            {loading ? "Analysing…" : "Analyse"}
          </button>
        </div>
      )}

      {error && <div style={styles.errorBox}>⚠️ {error}</div>}
      {loading && (
        <div style={styles.loadingBox}>
          <span>Building dependency graph…</span>
        </div>
      )}

      {data && !loading && (
        <>
          <div style={styles.riskRow}>
            <span
              style={{
                ...styles.riskBadge,
                background: RISK_COLORS[data.risk_level],
              }}
            >
              {RISK_ICONS[data.risk_level]} {data.risk_level.toUpperCase()} —
              Score {data.risk_score}
            </span>
            <span style={styles.targetLabel}>
              Editing: <code style={styles.code}>{data.targetFile}</code>
            </span>
          </div>

          <WarningBanner data={data} />

          <div style={styles.metricsGrid}>
            <MetricCard value={data.total_reach} label="Total Reach" />
            <MetricCard
              value={data.impacted_pages.length}
              label="Impacted Pages"
            />
            <MetricCard
              value={data.vulnerable_count}
              label="Uncovered Files"
              color="#f44336"
            />
            <MetricCard
              value={data.risk_score}
              label="Risk Score"
              color={RISK_COLORS[data.risk_level]}
            />
          </div>

          {data.impacted_pages.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Impacted Pages / Routes</h3>
              <div style={styles.tagList}>
                {data.impacted_pages.map((p) => (
                  <span key={p} style={styles.pageTag}>
                    📄 {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.vulnerable_files.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                ❌ Uncovered Files (0% coverage)
              </h3>
              <div style={styles.tagList}>
                {data.vulnerable_files.map((f) => (
                  <span key={f} style={styles.vulnTag}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          <DependencyChainTable chain={data.dependency_chain} />
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: "Inter, system-ui, sans-serif",
    background: "#0d1117",
    color: "#e6edf3",
    minHeight: "100vh",
    padding: "24px",
    boxSizing: "border-box",
  },
  header: { marginBottom: 24 },
  headerTitle: { margin: "0 0 4px", fontSize: 24, fontWeight: 700 },
  headerSub: { margin: 0, opacity: 0.6, fontSize: 14 },
  inputRow: { display: "flex", gap: 8, marginBottom: 16 },
  input: {
    flex: 1,
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: 6,
    color: "#e6edf3",
    padding: "8px 12px",
    fontSize: 14,
    outline: "none",
  },
  analyseBtn: {
    background: "#1f6feb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "8px 18px",
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 600,
  },
  errorBox: {
    background: "#b71c1c22",
    border: "1px solid #f44336",
    borderRadius: 6,
    padding: "10px 14px",
    marginBottom: 16,
    fontSize: 14,
  },
  loadingBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    opacity: 0.7,
    padding: "16px 0",
  },
  riskRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  riskBadge: {
    padding: "4px 14px",
    borderRadius: 20,
    fontWeight: 700,
    fontSize: 13,
    color: "#fff",
    letterSpacing: 0.5,
  },
  targetLabel: { fontSize: 13, opacity: 0.7 },
  code: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: 4,
    padding: "1px 5px",
    fontFamily: "monospace",
    fontSize: 12,
    color: "#e6edf3",
  },
  warningBanner: {
    display: "flex",
    gap: 14,
    background: "#b71c1c18",
    border: "1.5px solid",
    borderRadius: 8,
    padding: "14px 16px",
    marginBottom: 20,
    alignItems: "flex-start",
  },
  warningIcon: { fontSize: 24, flexShrink: 0 },
  warningTitle: { fontWeight: 700, fontSize: 15, marginBottom: 4 },
  warningBody: { fontSize: 14, lineHeight: 1.5, opacity: 0.9 },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: 8,
    padding: "14px 12px",
    textAlign: "center",
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 800,
    lineHeight: 1,
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 11,
    opacity: 0.6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    margin: "0 0 10px",
    fontSize: 15,
    fontWeight: 600,
    borderBottom: "1px solid #21262d",
    paddingBottom: 6,
  },
  tagList: { display: "flex", flexWrap: "wrap", gap: 8 },
  pageTag: {
    background: "#1f6feb22",
    border: "1px solid #1f6feb66",
    color: "#79c0ff",
    borderRadius: 4,
    padding: "3px 8px",
    fontSize: 12,
    fontFamily: "monospace",
  },
  vulnTag: {
    background: "#b71c1c22",
    border: "1px solid #f4433666",
    color: "#ff7070",
    borderRadius: 4,
    padding: "3px 8px",
    fontSize: 12,
    fontFamily: "monospace",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left",
    padding: "6px 10px",
    borderBottom: "1px solid #21262d",
    opacity: 0.6,
    fontWeight: 600,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  td: { padding: "5px 10px", verticalAlign: "middle" },
  trEven: { background: "transparent" },
  trOdd: { background: "#161b2240" },
  fileName: { fontFamily: "monospace", fontSize: 12 },
  fileNameUncovered: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#f44336",
  },
  coverageBarTrack: {
    position: "relative",
    background: "#21262d",
    borderRadius: 4,
    height: 18,
    minWidth: 80,
    overflow: "hidden",
  },
  coverageBarFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    borderRadius: 4,
    transition: "width 0.3s ease",
  },
  coverageBarLabel: {
    position: "absolute",
    right: 6,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 11,
    fontWeight: 600,
    color: "#e6edf3",
    zIndex: 1,
  },
  expandBtn: {
    marginTop: 8,
    background: "transparent",
    border: "1px solid #30363d",
    color: "#79c0ff",
    borderRadius: 4,
    padding: "4px 12px",
    cursor: "pointer",
    fontSize: 12,
  },
};

export default BlastRadiusPanel;
