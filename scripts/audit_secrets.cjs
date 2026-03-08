const fs = require("fs");
const path = require("path");

const PATTERNS = [
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/g, severity: "HIGH" },
  {
    name: "AWS Secret Key",
    regex: /wJalrXUtnFEMI\/K7MDENG\/bPxRfiCYEXAMPLEKEY/g,
    severity: "HIGH",
  }, // Example pattern
  {
    name: "Google API Key",
    regex: /AIza[0-9A-Za-z\\-_]{35}/g,
    severity: "HIGH",
  },
  {
    name: "Generic Secret Assignment",
    regex:
      /(?:api_key|access_token|secret_key|password)\s*[:=]\s*['"]([a-zA-Z0-9_\-]{8,})['"]/gi,
    severity: "MEDIUM",
  },
  {
    name: "Private Key Block",
    regex: /-----BEGIN PRIVATE KEY-----/g,
    severity: "CRITICAL",
  },
];

// Exclude these
const IGNORE_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  "scripts",
];
const IGNORE_FILES = [
  "package-lock.json",
  "pnpm-lock.yaml",
  "audit_secrets.js",
  "audit_metrics.js",
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const findings = [];
    const lines = content.split("\n");

    PATTERNS.forEach((pattern) => {
      let match;
      // Reset lastIndex for global regex
      pattern.regex.lastIndex = 0;

      // For simple regex without 'g', we match once. For 'g', we loop.
      // Using a simple loop over lines for context is safer for reporting line numbers.
      lines.forEach((line, index) => {
        // Check if line matches
        const matches = line.match(pattern.regex);
        if (matches) {
          findings.push({
            type: pattern.name,
            file: filePath,
            line: index + 1,
            match: matches[0].substring(0, 5) + "***REDACTED***", // Don't print full secret
            severity: pattern.severity,
          });
        }
      });
    });
    return findings;
  } catch (e) {
    // binary files or permission errors
    return [];
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
      if (!IGNORE_FILES.includes(file)) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

console.log("Starting Secret Scan...");
const files = walkDir(".");
let allFindings = [];

files.forEach((file) => {
  const findings = scanFile(file);
  if (findings.length > 0) {
    allFindings = allFindings.concat(findings);
  }
});

if (allFindings.length === 0) {
  console.log("No secrets found.");
} else {
  console.log(JSON.stringify(allFindings, null, 2));
  console.log(`Found ${allFindings.length} potential secrets.`);
}
