import os

files_to_fix = [
    'website/categories/ci-cd-devops.md',
    'website/categories/deployment-hosting.md',
    'website/categories/error-monitoring-logging.md',
    'website/categories/monorepo-tools.md',
    'website/categories/security-compliance.md',
]

for filepath in files_to_fix:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    
    # Find the badge section (starts with ## 🧪 关联代码实验室)
    badge_start = None
    badge_end = None
    for i, line in enumerate(lines):
        if line.strip() == '## 🧪 关联代码实验室':
            badge_start = i
        if badge_start is not None and badge_end is None:
            # Find end of badge section - the line before the next structural element
            # Actually, find where the badge section ends (before # Title or ---)
            if i > badge_start and (line.startswith('# ') or line.startswith('---')):
                badge_end = i
                break
    
    if badge_start is None or badge_end is None:
        print(f'Could not find badge section in {filepath}')
        continue
    
    # Extract badge lines
    badge_lines = lines[badge_start:badge_end]
    
    # Remove badge from current position
    remaining_lines = lines[:badge_start] + lines[badge_end:]
    
    # Find the # Title heading in remaining lines
    title_idx = None
    for i, line in enumerate(remaining_lines):
        if line.startswith('# '):
            title_idx = i
            break
    
    if title_idx is None:
        print(f'Could not find title in {filepath}')
        continue
    
    # Find where to insert after title and its description
    insert_idx = title_idx + 1
    while insert_idx < len(remaining_lines):
        s = remaining_lines[insert_idx].strip()
        if s == '':
            # Check if next non-empty is structural
            k = insert_idx + 1
            while k < len(remaining_lines) and remaining_lines[k].strip() == '':
                k += 1
            if k < len(remaining_lines) and (remaining_lines[k].strip().startswith('## ') or remaining_lines[k].strip() == '---'):
                break
            insert_idx += 1
            continue
        if s.startswith('## ') or s == '---' or s.startswith('# '):
            break
        insert_idx += 1
    
    # Insert badge lines
    new_lines = remaining_lines[:insert_idx] + badge_lines + remaining_lines[insert_idx:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
    
    print(f'Fixed {filepath}')
