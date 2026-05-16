// Simple mock of the convertToLaTeX function to test in Node
const docContent = `
# OVERVIEW
This is a test report about **Project Genesis**.

## DATA_SYNTHESIS
We analyzed the following distribution:

\`\`\`latex
\\begin{tikzpicture}
  \\pie{40/Apples, 30/Pears, 30/Others}
\\end{tikzpicture}
\`\`\`

### QUANTITATIVE_RESULTS
| Metric | Value | Status |
| :--- | :--- | :--- |
| Performance | 98% | STABLE |
| Latency | 12ms | OPTIMAL |
| Drift | 0.2% | LOW |

> "The orchestration layer is now operative."
`;

// Copying logic from lib/latexExporter.ts (simplified for testing)
const convertToLaTeXMock = (content, title) => {
  let latex = "\\documentclass{article}\n\\usepackage{pgf-pie}\n\\usepackage{booktabs}\n\\begin{document}\n\n";
  let lines = content.split('\n');
  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.startsWith('# ')) latex += `\\section{${line.replace('# ', '')}}\n`;
    else if (line.startsWith('## ')) latex += `\\subsection{${line.replace('## ', '')}}\n`;
    else if (line.startsWith('### ')) latex += `\\subsubsection{${line.replace('### ', '')}}\n`;
    else if (line.startsWith('```latex')) {
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        latex += lines[i] + "\n";
        i++;
      }
    } else if (line.startsWith('|') && !line.includes('---')) {
      const cells = line.split('|').filter(c => c.trim() !== "").map(c => c.trim());
      tableRows.push(cells);
      inTable = true;
    } else if (inTable && !line.startsWith('|')) {
      latex += `\\begin{tabular}{lll}\n\\toprule\n${tableRows[0].join(' & ')} \\\\\n\\midrule\n`;
      for(let j=1; j<tableRows.length; j++) latex += `${tableRows[j].join(' & ')} \\\\\n`;
      latex += "\\bottomrule\n\\end{tabular}\n\n";
      inTable = false;
      tableRows = [];
    } else if (line !== "") {
      latex += line.replace(/\*\*(.*?)\*\*/g, '\\textbf{$1}') + "\n\n";
    }
  }
  latex += "\\end{document}";
  return latex;
};

const result = convertToLaTeXMock(docContent, "TEST_REPORT");
console.log("--- GENERATED LATEX ---");
console.log(result);

if (result.includes("\\section{OVERVIEW}") && 
    result.includes("\\pie{40/Apples") && 
    result.includes("\\begin{tabular}") &&
    result.includes("\\textbf{Project Genesis}")) {
  console.log("\nSUCCESS: LaTeX conversion logic verified.");
} else {
  console.log("\nFAILURE: LaTeX conversion logic failed verification.");
  process.exit(1);
}
