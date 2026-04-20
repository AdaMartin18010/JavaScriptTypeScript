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
    
    # Find the badge section
    badge_start = None
    badge_end = None
    for i, line in enumerate(lines):
        if line.strip() == '## 🧪 关联代码实验室':
            badge_start = i
        if badge_start is not None and badge_end is None:
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
    
    # Find the # Title heading
    title_idx = None
    for i, line in enumerate(remaining_lines):
        if line.startswith('# '):
            title_idx = i
            break
    
    if title_idx is None:
        print(f'Could not find title in {filepath}')
        continue
    
    # Find insert point after title and description
    insert_idx = title_idx + 1
    while insert_idx < len(remaining_lines):
        s = remaining_lines[insert_idx].strip()
        if s == '':
            k = insert_idx + 1
            while k < len(remaining_lines) and remaining_lines[k].strip() == '':
                k += 1
            if k < len(remaining_lines) and (remaining_lines[k].strip().startswith('## ') or remaining_lines[k].strip() == '---'):
                # Skip this blank line, insert after it
                insert_idx = k
                break
            insert_idx += 1
            continue
        if s.startswith('## ') or s == '---' or s.startswith('# '):
            break
        insert_idx += 1
    
    # Ensure badge starts with a blank line for separation
    if badge_lines and badge_lines[0].strip() != '':
        badge_lines = [''] + badge_lines
    
    # Insert badge lines
    new_lines = remaining_lines[:insert_idx] + badge_lines + remaining_lines[insert_idx:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
    
    print(f'Fixed {filepath}')
