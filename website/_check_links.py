import re, os

with open('.vitepress/sidebar.ts', 'r', encoding='utf-8') as f:
    content = f.read()

links = re.findall(r'link:\s*["\']([^"\']+)["\']', content)
unique = sorted(set(links))
missing = []
for link in unique:
    if link.startswith('/'):
        path = link.lstrip('/')
        # Check both path.md and path/index.md
        md_file = path + '.md'
        index_file = os.path.join(path, 'index.md')
        if not os.path.exists(md_file) and not os.path.exists(index_file):
            missing.append(path)

print('Missing files:', len(missing))
for m in missing[:50]:
    print(m)
