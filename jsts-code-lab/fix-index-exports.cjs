const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname);

function toCamelCase(str) {
  return str
    .split(/[-_]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

function getNameFromPath(relativePath) {
  const normalized = relativePath.replace(/\.js$/, '').replace(/^\.\//, '');
  const parts = normalized.split('/');
  const fileName = parts[parts.length - 1];
  if (fileName === 'index') {
    return toCamelCase(parts[parts.length - 2] || fileName);
  }
  return toCamelCase(fileName);
}

function resolveExportPath(indexDir, relativePath) {
  // Remove leading ./ and trailing .js if present
  let cleanPath = relativePath.replace(/^\.\//, '');
  cleanPath = cleanPath.replace(/\.js$/, '');
  return path.join(indexDir, cleanPath);
}

function processIndexFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let modified = false;
  const newLines = [];

  for (const line of lines) {
    const match = line.match(/^(\s*)export\s+\*\s+from\s+['"]([^'"]+)['"];?(\s*)$/);
    if (match) {
      const [, leadingSpace, exportPath, trailingSpace] = match;
      const resolvedPath = resolveExportPath(path.dirname(filePath), exportPath);
      const exists = fs.existsSync(resolvedPath) || fs.existsSync(resolvedPath + '.ts');
      
      if (!exists) {
        console.log(`[DELETE] ${filePath}: ${line.trim()}`);
        modified = true;
        continue;
      }
      
      const name = getNameFromPath(exportPath);
      const newLine = `${leadingSpace}export * as ${name} from '${exportPath}';${trailingSpace}`;
      if (newLine !== line) {
        console.log(`[REPLACE] ${filePath}: ${line.trim()} -> ${newLine.trim()}`);
        modified = true;
      }
      newLines.push(newLine);
    } else {
      newLines.push(line);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
  }
}

function findIndexFiles(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const lowerName = entry.name.toLowerCase();
      if (lowerName === 'node_modules' || lowerName === 'dist' || lowerName === 'tests') {
        continue;
      }
      findIndexFiles(fullPath, results);
    } else if (entry.name === 'index.ts') {
      results.push(fullPath);
    }
  }
  return results;
}

const indexFiles = findIndexFiles(baseDir);

for (const file of indexFiles) {
  if (file === path.join(baseDir, 'tests', 'index.ts')) {
    console.log(`[SKIP] ${file}`);
    continue;
  }
  processIndexFile(file);
}

console.log(`Processed ${indexFiles.length} index.ts files.`);
