import { Router, Request, Response } from "express";
import path from "path";
import { analyseBlastRadius } from "../services/blastRadiusService";
const router = Router();

router.get("/", (req: Request, res: Response) => {
  const { file, root, src } = req.query as Record<string, string>;

  if (!file) {
    return res
      .status(400)
      .json({ error: "`file` query parameter is required." });
  }

  // Auto-detect project root from the file path
  let projectRoot: string;
  if (root) {
    projectRoot = path.resolve(root);
  } else if (path.isAbsolute(file)) {
    // Extract project root from absolute file path
    // Look for common project markers: src, package.json
    let currentDir = path.dirname(file);
    while (currentDir !== path.parse(currentDir).root) {
      if (currentDir.includes("demo-app")) {
        projectRoot = currentDir.substring(
          0,
          currentDir.indexOf("demo-app") + "demo-app".length,
        );
        break;
      }
      currentDir = path.dirname(currentDir);
    }
    if (!projectRoot!) {
      projectRoot = path.dirname(file);
    }
  } else {
    projectRoot = process.cwd();
  }

  const srcDir = src
    ? path.resolve(projectRoot, src)
    : path.join(projectRoot, "src");

  try {
    const result = analyseBlastRadius(file, { projectRoot, srcDir });
    return res.json({
      targetFile: result.targetFile,
      impacted_pages: result.impacted_pages,
      vulnerable_files: result.vulnerable_files,
      vulnerable_count: result.vulnerable_count,
      total_reach: result.total_reach,
      risk_score: result.risk_score,
      risk_level: result.risk_level,
      dependency_chain: result.dependency_chain,
      coverage_map: result.coverage_map,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Blast Radius Error:", message);
    return res.status(500).json({ error: message });
  }
});

export default router;
