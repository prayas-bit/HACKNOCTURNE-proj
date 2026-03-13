// lcov.info -> JSON logic
export function parseLcov(lcovData: string) {
    const files: { name: string, linesCount: number, linesHit: number, coverage: number }[] = [];
    const sections = lcovData.split('end_of_record');

    for (const section of sections) {
        if (!section.trim()) continue;

        const sfMatch = section.match(/SF:(.+)/);
        if (!sfMatch) continue;

        const filePath = sfMatch[1];
        const fileName = filePath.split(/[/\\]/).pop() || filePath;

        const linesFoundMatch = section.match(/LF:(\d+)/);
        const linesHitMatch = section.match(/LH:(\d+)/);

        if (linesFoundMatch && linesHitMatch) {
            const linesCount = parseInt(linesFoundMatch[1]);
            const linesHit = parseInt(linesHitMatch[1]);
            const coverage = linesCount > 0 ? Math.round((linesHit / linesCount) * 100) : 0;

            files.push({ name: fileName, linesCount, linesHit, coverage });
        }
    }

    const totalLines = files.reduce((sum, f) => sum + f.linesCount, 0);
    const totalHit = files.reduce((sum, f) => sum + f.linesHit, 0);
    const globalCoverage = totalLines > 0 ? Math.round((totalHit / totalLines) * 100) : 0;

    return {
        global: globalCoverage,
        files: files
    };
}
