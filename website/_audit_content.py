import os, re

# Extract all sidebar links
with open('.vitepress/sidebar.ts', 'r', encoding='utf-8') as f:
    sidebar = f.read()
links = set(re.findall(r'link:\s*["\']([^"\']+)["\']', sidebar))
linked_files = set()
for link in links:
    if link.startswith('/'):
        path = link.lstrip('/')
        linked_files.add(path + '.md')
        linked_files.add(os.path.join(path, 'index.md'))

# Find all markdown files
all_md = []
for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.vitepress' in root or '_temp' in root or 'dist' in root:
        continue
    for f in files:
        if f.endswith('.md'):
            all_md.append(os.path.join(root, f))

# Find orphans
orphans = []
for md in all_md:
    rel = md.lstrip('.\\/')
    # Normalize path separators
    rel = rel.replace('\\', '/')
    if rel not in linked_files:
        # Check if it's an index.md that could be accessed via parent dir
        parts = rel.split('/')
        if parts[-1] == 'index.md' and len(parts) > 1:
            parent_dir = '/'.join(parts[:-1])
            if parent_dir + '/index.md' not in linked_files and parent_dir + '.md' not in linked_files:
                orphans.append(rel)
        else:
            orphans.append(rel)

# Find small non-index files
small_files = []
for md in all_md:
    rel = md.lstrip('.\\/').replace('\\', '/')
    if os.path.getsize(md) < 4096 and not rel.endswith('/index.md') and rel != 'index.md':
        small_files.append((rel, os.path.getsize(md)))

print(f"Total markdown files: {len(all_md)}")
print(f"Linked files: {len(linked_files)}")
print(f"Orphan pages: {len(orphans)}")
for o in sorted(orphans)[:30]:
    print(f"  {o}")

print(f"\nSmall non-index files (<4KB): {len(small_files)}")
for f, sz in sorted(small_files, key=lambda x: x[1])[:20]:
    print(f"  {f} ({sz} bytes)")
