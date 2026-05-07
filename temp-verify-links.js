const fs = require('fs');
const path = require('path');

const sidebarContent = fs.readFileSync('website/.vitepress/sidebar.ts', 'utf8');
const linkRegex = /link:\s*['"]([^'"]+)['"]/g;
const links = [];
let match;
while ((match = linkRegex.exec(sidebarContent)) !== null) {
    links.push(match[1]);
}

console.log('Total links in sidebar:', links.length);

const missing = [];
const found = [];
for (const link of links) {
    // Skip external URLs
    if (link.startsWith('http')) {
        found.push(link + ' (external)');
        continue;
    }
    // Index pages
    let filePath;
    if (link.endsWith('/')) {
        filePath = path.join('website', link, 'index.md');
    } else {
        filePath = path.join('website', link + '.md');
    }
    if (fs.existsSync(filePath)) {
        found.push(link);
    } else {
        missing.push(link);
    }
}

console.log('Found:', found.length);
console.log('Missing:', missing.length);
if (missing.length > 0) {
    console.log('\nMissing files:');
    missing.forEach(m => console.log('  -', m));
    process.exit(1);
} else {
    console.log('\nAll sidebar links verified OK!');
}
