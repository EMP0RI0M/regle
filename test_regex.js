const content = `\\begin{tikzpicture}
  \\pie[rotate=180]{40/Apples, 30/Pears, 30/Others}
\\end{tikzpicture}`;

const pieMatch = content.match(/\\pie(?:\[.*?\])?\s*\{(.*?)\}/s);
console.log("PIE MATCH:", pieMatch ? "FOUND" : "NOT FOUND");
if (pieMatch) {
  const dataStr = pieMatch[1];
  const data = dataStr.split(',').map(pair => {
    const [val, lab] = pair.trim().split('/');
    return { name: lab?.trim() || "???", value: parseFloat(val) || 0 };
  });
  console.log("PIE DATA:", JSON.stringify(data, null, 2));
}

const tableContent = `\\begin{tikzpicture}
  \\begin{axis}[ybar]
    \\addplot coordinates {(Alpha, 10.5) (Beta, 20.2) (Gamma, 15.0)};
  \\end{axis}
\\end{tikzpicture}`;

const coordMatch = tableContent.match(/\\addplot\s+coordinates\s*\{(.*?)\}/s);
console.log("\nCOORD MATCH:", coordMatch ? "FOUND" : "NOT FOUND");
if (coordMatch) {
  const coords = coordMatch[1].match(/\(([^)]+),([^)]+)\)/g);
  if (coords) {
    const data = coords.map(c => {
      const parts = c.replace(/[()]/g, '').split(',');
      return { name: parts[0].trim(), value: parseFloat(parts[1]) || 0 };
    });
    console.log("COORD DATA:", JSON.stringify(data, null, 2));
  }
}
