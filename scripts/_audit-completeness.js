const fs = require('fs');
const path = require('path');

const ROOT = './70-theoretical-foundations';
const EXCLUDE = new Set([
  'README.md','CRITICAL_ASSESSMENT_REPORT_2026.md','MASTER_PLAN.md',
  'FOLLOW_UP_PLAN.md','CROSS_REFERENCE.md','KNOWLEDGE_GRAPH.md','NOTATION_GUIDE.md',
  '14-legacy-browser-rendering-engine-principles.md',
  'RENDERING_PIPELINE_IMPROVEMENT_PLAN_2026.md',
  'CONTENT_RESTRUCTURING_PLAN_2026.md',
  '14-browser-rendering-engine-principles.md'
]);

function walk(dir, files=[]) {
  for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== '.content-audit') walk(p, files);
    else if (e.isFile() && e.name.endsWith('.md') && !EXCLUDE.has(e.name)) files.push(p);
  }
  return files;
}

const files = walk(ROOT);
console.log('Total docs:', files.length);

let missingAbstract = 0, missingCounter = 0, missingMatrix = 0, missingSymmetric = 0, tsShort = 0;
const issues = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  
  const hasAbstract = content.includes('english-abstract:');
  if (!hasAbstract) { missingAbstract++; issues.push({file:f, issue:'缺少 english-abstract'}); }
  
  const hasCounter = content.includes('反例') && content.includes('局限性');
  if (!hasCounter) { missingCounter++; issues.push({file:f, issue:'缺少 反例与局限性'}); }
  
  const hasMatrix = content.includes('工程决策矩阵') || content.includes('决策矩阵');
  if (!hasMatrix) { missingMatrix++; issues.push({file:f, issue:'缺少 决策矩阵'}); }
  
  const hasSymmetric = content.includes('对称差');
  if (!hasSymmetric) { missingSymmetric++; issues.push({file:f, issue:'缺少 对称差分析'}); }
  
  const tsBlocks = content.match(/```typescript[\s\S]*?```/g) || [];
  if (tsBlocks.length < 6) { 
    tsShort++; 
    issues.push({file:f, issue:'TS示例不足 ('+tsBlocks.length+'/6)'}); 
  }
}

console.log('');
console.log('=== 汇总 ===');
console.log('缺少 english-abstract:', missingAbstract);
console.log('缺少 反例与局限性:', missingCounter);
console.log('缺少 决策矩阵:', missingMatrix);
console.log('缺少 对称差分析:', missingSymmetric);
console.log('TS示例不足:', tsShort);
console.log('');
console.log('=== 详细问题列表 ===');
issues.forEach(i => console.log(i.file.replace('./70-theoretical-foundations/',''), '|', i.issue));
