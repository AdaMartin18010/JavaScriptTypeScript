<template>
  <button
    v-if="visible"
    class="sb-button"
    :title="title"
    @click="openInStackBlitz"
  >
    <span class="sb-icon">⚡</span>
    <span class="sb-text">在 StackBlitz 打开</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visible = ref(false)
const title = ref('')
const code = ref('')
const lang = ref('')

onMounted(() => {
  const el = document.querySelector('.sb-anchor')
  if (!el) return
  
  const pre = el.closest('div[class*="language-"]')
  if (!pre) return
  
  const codeEl = pre.querySelector('code')
  if (!codeEl) return
  
  code.value = codeEl.textContent || ''
  
  const classList = pre.className.split(' ')
  const langClass = classList.find(c => c.startsWith('language-'))
  lang.value = langClass ? langClass.replace('language-', '') : 'typescript'
  
  visible.value = ['ts', 'typescript', 'js', 'javascript'].includes(lang.value)
  title.value = `在 StackBlitz 中运行这段 ${lang.value} 代码`
})

async function openInStackBlitz() {
  const sdk = await import('@stackblitz/sdk')
  
  const ext = lang.value.startsWith('ts') ? 'ts' : 'js'
  const isTs = ext === 'ts'
  
  sdk.default.openProject({
    title: 'JSTS Code Lab',
    description: '从 Awesome JS/TS Ecosystem 代码实验室运行',
    template: isTs ? 'node' : 'javascript',
    files: {
      [`index.${ext}`]: code.value,
      'package.json': JSON.stringify({
        name: 'jsts-lab-run',
        version: '1.0.0',
        type: 'module',
        scripts: {
          start: isTs ? 'tsx index.ts' : 'node index.js'
        },
        devDependencies: isTs ? { typescript: '^5.8', tsx: '^4.0' } : {}
      }, null, 2)
    }
  }, {
    newWindow: true,
    openFile: `index.${ext}`
  })
}
</script>

<style scoped>
.sb-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  margin-left: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border: 1px solid var(--vp-c-brand-3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sb-button:hover {
  background: var(--vp-c-brand-3);
  color: white;
}

.sb-icon {
  font-size: 14px;
  line-height: 1;
}

.sb-text {
  line-height: 1;
}
</style>
