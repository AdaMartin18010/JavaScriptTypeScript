/**
 * 客户端脚本：自动为代码块添加 StackBlitz 打开按钮
 * 仅对包含可运行 TypeScript/JavaScript 代码的块生效
 */

function enhanceCodeBlocks() {
  const codeBlocks = document.querySelectorAll('.vp-doc div[class*="language-"]')
  
  codeBlocks.forEach(block => {
    // 避免重复处理
    if (block.hasAttribute('data-sb-enhanced')) return
    block.setAttribute('data-sb-enhanced', 'true')
    
    // 检测语言
    const langClass = Array.from(block.classList).find(c => c.startsWith('language-'))
    const lang = langClass ? langClass.replace('language-', '') : ''
    
    // 只处理 ts/js
    if (!['ts', 'typescript', 'js', 'javascript'].includes(lang)) return
    
    // 获取代码内容
    const codeEl = block.querySelector('code')
    if (!codeEl) return
    const code = codeEl.textContent || ''
    
    // 创建按钮容器
    const btnContainer = document.createElement('div')
    btnContainer.className = 'sb-action-bar'
    btnContainer.style.cssText = 'display:flex;justify-content:flex-end;padding:4px 12px;border-top:1px solid var(--vp-c-divider);background:var(--vp-c-bg-soft);'
    
    // StackBlitz 按钮
    const sbBtn = document.createElement('button')
    sbBtn.className = 'sb-run-btn'
    sbBtn.innerHTML = '<span>⚡</span> 在 StackBlitz 打开'
    sbBtn.title = '在 StackBlitz 中运行此代码'
    sbBtn.onclick = () => openInStackBlitz(code, lang)
    
    btnContainer.appendChild(sbBtn)
    block.appendChild(btnContainer)
  })
}

async function openInStackBlitz(code: string, lang: string) {
  try {
    const sdk = await import('@stackblitz/sdk')
    const ext = lang.startsWith('ts') ? 'ts' : 'js'
    const isTs = ext === 'ts'
    
    sdk.default.openProject({
      title: 'JSTS Code Lab',
      description: '从 Awesome JS/TS Ecosystem 代码实验室运行',
      template: isTs ? 'node' : 'javascript',
      files: {
        [`index.${ext}`]: code,
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
  } catch (err) {
    console.error('Failed to open StackBlitz:', err)
    alert('打开 StackBlitz 失败，请检查网络连接')
  }
}

// 页面切换后重新增强
function init() {
  enhanceCodeBlocks()
}

if (typeof window !== 'undefined') {
  // 初始运行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
  
  // 监听 VitePress 路由变化
  window.addEventListener('popstate', () => setTimeout(init, 300))
}
