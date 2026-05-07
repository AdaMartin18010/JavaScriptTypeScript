# Scripts

Utility scripts for maintenance and automation.

---

## Available Scripts

| Script | Purpose | Run |
|:---|:---|:---|
| `version-tracker.js` | Compare documented vs. latest npm versions | `node scripts/version-tracker.js` |
| `validate-mermaid.js` | Check Mermaid diagram syntax | `node scripts/validate-mermaid.js` |
| `term-audit.js` | Check terminology consistency across docs | `node scripts/term-audit.js` |

---

## version-tracker.js

Checks if documented versions match the latest published versions on npm.

```bash
node scripts/version-tracker.js
```

**Output**:
```
📦 Version Tracker
==================
Package          Documented    Latest        Status
---------------------------------------------------------
svelte           5.28.2        5.28.2        ✅ up to date
typescript       5.8.3         5.9.0-beta    ⚠️  newer available
vite             6.3.5         6.3.5         ✅ up to date
```

---

## validate-mermaid.js

Validates Mermaid diagram syntax in all markdown files.

```bash
node scripts/validate-mermaid.js
```

**Checks**:
- Diagram type is supported
- Opening/closing markers match
- No nested code blocks

---

## term-audit.js

Ensures consistent terminology across all 30+ markdown documents.

```bash
node scripts/term-audit.js
```

**Checks**:
- Preferred term usage (e.g., `$state` not `useState`)
- Capitalization consistency
- Framework naming conventions

---

## CI Integration

All scripts run automatically via `.github/workflows/content-health-check.yml`:

```yaml
# Weekly on Sundays at 00:00 UTC
- cron: '0 0 * * 0'
```

---

> For manual runs, ensure you're in the `website/svelte-signals-stack/` directory.
