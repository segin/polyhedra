const fs = require("fs");
const path = require("path");

const IGNORE_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  "scripts",
  "reference",
  "verification",
];

// Simple complexity proxy: count branching/control keywords
const COMPLEXITY_REGEX =
  /\b(if|else|while|for|case|catch|throw|return|&&|\|\||\?)\b/g;

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n").length;

    const matches = content.match(COMPLEXITY_REGEX);
    const complexity = matches ? matches.length + 1 : 1; // Base complexity 1

    return {
      file: filePath,
      lines,
      complexity,
      density: (complexity / lines).toFixed(2),
    };
  } catch (e) {
    return null;
  }
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    if (IGNORE_DIRS.includes(file)) return;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath, fileList);
    } else {
      if (
        file.endsWith(".js") ||
        file.endsWith(".jsx") ||
        file.endsWith(".ts")
      ) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

console.log("Starting Metrics Scan...");
const files = walkDir(".");
const results = files.map(analyzeFile).filter((r) => r !== null);

// Top 10 Complexity
const topComplexity = [...results]
  .sort((a, b) => b.complexity - a.complexity)
  .slice(0, 10);
const totalLOC = results.reduce((acc, curr) => acc + curr.lines, 0);

console.log("--- Summary ---");
console.log(`Total Files: ${results.length}`);
console.log(`Total LOC: ${totalLOC}`);
console.log("\n--- Top 10 Complex Files ---");
topComplexity.forEach((r) => {
  console.log(`${r.file}: Complexity ${r.complexity}, LOC ${r.lines}`);
});

// JSON output for parsing
console.log("\n--- JSON OUTPUT ---");
console.log(JSON.stringify({ totalLOC, topComplexity }, null, 2));
