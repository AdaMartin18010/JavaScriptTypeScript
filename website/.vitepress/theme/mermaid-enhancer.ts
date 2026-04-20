/**
 * Mermaid 图表交互增强：缩放、全屏查看、导出 PNG/SVG
 */

interface MermaidState {
  scale: number
  panning: boolean
  panX: number
  panY: number
  startX: number
  startY: number
}

const stateMap = new WeakMap<HTMLElement, MermaidState>()

function initMermaidEnhancer() {
  const diagrams = document.querySelectorAll('.mermaid')
  
  diagrams.forEach((diagram, index) => {
    if (diagram.hasAttribute('data-enhanced')) return
    diagram.setAttribute('data-enhanced', 'true')
    
    const wrapper = document.createElement('div')
    wrapper.className = 'mermaid-wrapper'
    wrapper.style.cssText = 'position:relative;overflow:hidden;border-radius:8px;border:1px solid var(--vp-c-divider);'
    
    diagram.parentNode?.insertBefore(wrapper, diagram)
    wrapper.appendChild(diagram)
    
    const state: MermaidState = {
      scale: 1,
      panning: false,
      panX: 0,
      panY: 0,
      startX: 0,
      startY: 0
    }
    stateMap.set(diagram as HTMLElement, state)
    
    // 工具栏
    const toolbar = document.createElement('div')
    toolbar.className = 'mermaid-toolbar'
    toolbar.innerHTML = `
      <button class="mermaid-btn" data-action="zoomIn" title="放大">🔍+</button>
      <button class="mermaid-btn" data-action="zoomOut" title="缩小">🔍-</button>
      <button class="mermaid-btn" data-action="reset" title="重置">⟲</button>
      <button class="mermaid-btn" data-action="fullscreen" title="全屏">⛶</button>
      <button class="mermaid-btn" data-action="exportSvg" title="导出 SVG">💾 SVG</button>
      <button class="mermaid-btn" data-action="exportPng" title="导出 PNG">🖼️ PNG</button>
    `
    toolbar.style.cssText = 'position:absolute;top:8px;right:8px;display:flex;gap:4px;z-index:10;opacity:0;transition:opacity 0.2s;'
    wrapper.appendChild(toolbar)
    
    wrapper.addEventListener('mouseenter', () => { toolbar.style.opacity = '1' })
    wrapper.addEventListener('mouseleave', () => { toolbar.style.opacity = '0' })
    
    // 按钮事件
    toolbar.querySelectorAll('.mermaid-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const action = (btn as HTMLElement).dataset.action
        handleAction(diagram as HTMLElement, action!, wrapper)
      })
    })
    
    // 拖拽平移
    const svg = diagram.querySelector('svg')
    if (svg) {
      svg.style.cursor = 'grab'
      svg.style.transition = 'transform 0.1s ease-out'
      
      svg.addEventListener('mousedown', (e) => {
        state.panning = true
        state.startX = e.clientX - state.panX
        state.startY = e.clientY - state.panY
        svg.style.cursor = 'grabbing'
      })
      
      window.addEventListener('mousemove', (e) => {
        if (!state.panning) return
        state.panX = e.clientX - state.startX
        state.panY = e.clientY - state.startY
        updateTransform(diagram as HTMLElement, state)
      })
      
      window.addEventListener('mouseup', () => {
        state.panning = false
        svg.style.cursor = 'grab'
      })
      
      // 滚轮缩放
      wrapper.addEventListener('wheel', (e) => {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        state.scale = Math.max(0.3, Math.min(5, state.scale * delta))
        updateTransform(diagram as HTMLElement, state)
      }, { passive: false })
    }
  })
}

function updateTransform(el: HTMLElement, state: MermaidState) {
  el.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`
  el.style.transformOrigin = 'center center'
}

function handleAction(diagram: HTMLElement, action: string, wrapper: HTMLElement) {
  const state = stateMap.get(diagram)
  if (!state) return
  
  switch (action) {
    case 'zoomIn':
      state.scale = Math.min(5, state.scale * 1.2)
      updateTransform(diagram, state)
      break
    case 'zoomOut':
      state.scale = Math.max(0.3, state.scale / 1.2)
      updateTransform(diagram, state)
      break
    case 'reset':
      state.scale = 1
      state.panX = 0
      state.panY = 0
      updateTransform(diagram, state)
      break
    case 'fullscreen':
      toggleFullscreen(wrapper)
      break
    case 'exportSvg':
      exportSvg(diagram)
      break
    case 'exportPng':
      exportPng(diagram)
      break
  }
}

function toggleFullscreen(wrapper: HTMLElement) {
  if (!document.fullscreenElement) {
    wrapper.requestFullscreen?.().catch(() => {})
  } else {
    document.exitFullscreen?.()
  }
}

function exportSvg(diagram: HTMLElement) {
  const svg = diagram.querySelector('svg')
  if (!svg) return
  
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svg)
  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `diagram-${Date.now()}.svg`
  a.click()
  URL.revokeObjectURL(url)
}

function exportPng(diagram: HTMLElement) {
  const svg = diagram.querySelector('svg')
  if (!svg) return
  
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svg)
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  
  const img = new Image()
  const rect = svg.getBoundingClientRect()
  const canvas = document.createElement('canvas')
  canvas.width = rect.width * 2
  canvas.height = rect.height * 2
  const ctx = canvas.getContext('2d')!
  
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(url)
    
    canvas.toBlob(blob => {
      if (!blob) return
      const pngUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = pngUrl
      a.download = `diagram-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(pngUrl)
    })
  }
  img.src = url
}

// 初始化
function init() {
  initMermaidEnhancer()
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
  window.addEventListener('popstate', () => setTimeout(init, 500))
}
