import json
import os
import glob

# Parse module inventory (handle BOM)
with open('jsts-code-lab/MODULE_INVENTORY.json', 'r', encoding='utf-8-sig') as f:
    modules = json.load(f)

# Build module lookup by name
module_by_name = {m['name']: m for m in modules}

# Maturity emoji mapping
MATURITY_EMOJI = {
    'mature': '🌳',
    'usable': '🌿',
    'seed': '🌱',
}

def get_maturity_emoji(category):
    return MATURITY_EMOJI.get(category, '🌱')

def compute_average_maturity(modules_list):
    if not modules_list:
        return ''
    score_map = {'mature': 2, 'usable': 1, 'seed': 0}
    total = sum(score_map.get(m['category'], 0) for m in modules_list)
    avg = total / len(modules_list)
    if avg >= 1.5:
        return '🌳'
    elif avg >= 0.5:
        return '🌿'
    else:
        return '🌱'

# Category to module mapping
category_mapping = {
    'frontend-frameworks': ['18-frontend-frameworks'],
    'ui-component-libraries': ['51-ui-components'],
    'build-tools': ['23-toolchain-configuration'],
    'data-visualization': ['58-data-visualization'],
    'state-management': ['15-data-flow'],
    'routing': ['18-frontend-frameworks'],
    'form-handling': ['16-application-development'],
    'validation': ['21-api-security'],
    'ssr-meta-frameworks': ['09-real-world-examples', '59-fullstack-patterns'],
    'styling': ['18-frontend-frameworks'],
    'orm-database': ['20-database-orm', '96-orm-modern-lab'],
    'testing': ['07-testing', '28-testing-advanced', '55-ai-testing'],
    'testing-ecosystem': ['07-testing', '28-testing-advanced'],
    'backend-frameworks': ['19-backend-development'],
    'linting-formatting': ['23-toolchain-configuration'],
    'mobile-development': ['37-pwa'],
    'animation': ['17-debugging-monitoring'],
    'mapping-visualization': ['58-data-visualization'],
    'micro-frontends': ['53-app-architecture'],
    'audio-video': [],  # 20-audio-video does not exist
    'webassembly': ['36-web-assembly'],
    'tanstack-start': ['86-tanstack-start-cloudflare'],
    'error-monitoring-logging': ['17-debugging-monitoring', '92-observability-lab'],
    'ci-cd-devops': ['22-deployment-devops'],
    'monorepo-tools': ['12-package-management'],
    'deployment-hosting': ['22-deployment-devops', '93-deployment-edge-lab'],
    'security-compliance': ['21-api-security', '38-web-security'],
    'ai-agent-infrastructure': ['33-ai-integration', '55-ai-testing', '94-ai-agent-lab', '82-edge-ai'],
    'authentication': ['21-api-security', '95-auth-modern-lab'],
}

def find_insert_point(lines):
    """Find where to insert the badge section: after title heading, or after frontmatter."""
    # Find end of frontmatter
    if len(lines) >= 2 and lines[0].strip() == '---':
        fm_end = None
        for i in range(1, len(lines)):
            if lines[i].strip() == '---':
                fm_end = i
                break
        if fm_end is not None:
            # Look for # Title heading after frontmatter
            for i in range(fm_end + 1, len(lines)):
                stripped = lines[i].strip()
                if stripped.startswith('# ') and not stripped.startswith('## '):
                    # Found title heading, insert after it and any following description
                    j = i + 1
                    while j < len(lines):
                        s = lines[j].strip()
                        # Stop at empty line followed by structural element, or at ---, or ##
                        if s == '':
                            # Check if next non-empty is structural
                            k = j + 1
                            while k < len(lines) and lines[k].strip() == '':
                                k += 1
                            if k < len(lines) and (lines[k].strip().startswith('## ') or lines[k].strip() == '---'):
                                return j
                            j += 1
                            continue
                        if s.startswith('## ') or s == '---':
                            return j
                        if s.startswith('# '):
                            return j
                        j += 1
                    return len(lines)
                elif stripped != '' and not stripped.startswith('#'):
                    # Non-empty, non-heading line before any title
                    break
            # No # title found, insert after frontmatter
            return fm_end + 1
    # No frontmatter, insert at beginning
    return 0

def generate_badge_section(related_modules):
    if not related_modules:
        return ''
    
    avg_maturity = compute_average_maturity(related_modules)
    count = len(related_modules)
    
    lines = []
    lines.append('')
    lines.append('## 🧪 关联代码实验室')
    lines.append('')
    lines.append(f'> **{count}** 个关联模块 · 平均成熟度：**{avg_maturity}**')
    lines.append('')
    lines.append('| 模块 | 成熟度 | 实现文件 | 测试文件 |')
    lines.append('|------|--------|----------|----------|')
    
    for m in related_modules:
        name = m['name']
        number = m['number']
        maturity = get_maturity_emoji(m['category'])
        impl = m['implementation_count']
        tests = m['test_count']
        link = f'[{number}-{name.split("-", 1)[1]}](../../jsts-code-lab/{name}/)'
        lines.append(f'| {link} | {maturity} | {impl} | {tests} |')
    
    lines.append('')
    return '\n'.join(lines)

def process_file(filepath, related_module_names):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    
    # Skip index.md
    if os.path.basename(filepath) == 'index.md':
        return
    
    # Get related modules
    related_modules = []
    for name in related_module_names:
        if name in module_by_name:
            related_modules.append(module_by_name[name])
    
    if not related_modules:
        print(f'Skipping {filepath} - no related modules')
        return
    
    # Check if already has the section
    if '🧪 关联代码实验室' in content:
        print(f'Skipping {filepath} - already has badge section')
        return
    
    insert_point = find_insert_point(lines)
    badge_section = generate_badge_section(related_modules)
    
    # Insert at the right place
    new_lines = lines[:insert_point] + badge_section.split('\n') + lines[insert_point:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
    
    print(f'Updated {filepath}')

# Process all category files
for filepath in glob.glob('website/categories/*.md'):
    basename = os.path.basename(filepath)
    name = basename.replace('.md', '')
    if name == 'index':
        continue
    if name in category_mapping:
        process_file(filepath, category_mapping[name])
    else:
        print(f'Warning: no mapping for {name}')

print('Done!')
