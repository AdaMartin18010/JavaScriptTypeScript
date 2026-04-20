/**
 * 学习路径进度追踪 — 使用 localStorage 记录用户在 learning-paths 的阅读进度
 */

interface ProgressData {
  completedSections: string[] // section id list
  lastVisited: string
  totalSections: number
}

const STORAGE_KEY = 'jsts-learning-progress'

export class LearningProgressTracker {
  private data: Record<string, ProgressData> = {}

  constructor() {
    this.load()
  }

  private load(): void {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) this.data = JSON.parse(raw)
    } catch {
      this.data = {}
    }
  }

  private save(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
  }

  getProgress(path: string): ProgressData {
    return this.data[path] ?? { completedSections: [], lastVisited: '', totalSections: 0 }
  }

  markSectionComplete(path: string, sectionId: string, totalSections: number): void {
    if (!this.data[path]) {
      this.data[path] = { completedSections: [], lastVisited: sectionId, totalSections }
    }
    if (!this.data[path].completedSections.includes(sectionId)) {
      this.data[path].completedSections.push(sectionId)
    }
    this.data[path].lastVisited = sectionId
    this.data[path].totalSections = totalSections
    this.save()
  }

  getCompletionRate(path: string): number {
    const progress = this.getProgress(path)
    if (progress.totalSections === 0) return 0
    return Math.round((progress.completedSections.length / progress.totalSections) * 100)
  }

  resetProgress(path: string): void {
    delete this.data[path]
    this.save()
  }

  resetAll(): void {
    this.data = {}
    this.save()
  }
}

// 自动注入进度 UI
function initProgressUI(): void {
  if (!document.location.pathname.includes('/learning-paths/')) return

  const tracker = new LearningProgressTracker()
  const path = document.location.pathname
  const progress = tracker.getProgress(path)

  // 查找所有 h2/h3 作为章节
  const sections = document.querySelectorAll('.vp-doc h2, .vp-doc h3')
  const totalSections = sections.length

  // 创建进度条
  const progressBar = document.createElement('div')
  progressBar.className = 'learning-progress-bar'
  progressBar.innerHTML = `
    <div class="progress-info">
      <span class="progress-label">学习进度</span>
      <span class="progress-percent">${tracker.getCompletionRate(path)}%</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style="width: ${tracker.getCompletionRate(path)}%"></div>
    </div>
    <button class="progress-reset">重置进度</button>
  `

  // 插入到页面顶部
  const firstHeading = document.querySelector('.vp-doc h1')
  if (firstHeading) {
    firstHeading.insertAdjacentElement('afterend', progressBar)
  }

  // 为每个章节添加完成按钮
  sections.forEach((section, index) => {
    const sectionId = `section-${index}`
    const isCompleted = progress.completedSections.includes(sectionId)

    const checkbox = document.createElement('span')
    checkbox.className = `section-check ${isCompleted ? 'completed' : ''}`
    checkbox.innerHTML = isCompleted ? '✅' : '⬜'
    checkbox.title = isCompleted ? '标记为未完成' : '标记为已完成'
    checkbox.style.cssText = 'cursor:pointer;margin-right:8px;font-size:1.2em;user-select:none;'

    checkbox.addEventListener('click', () => {
      const completed = checkbox.classList.contains('completed')
      if (completed) {
        checkbox.classList.remove('completed')
        checkbox.innerHTML = '⬜'
        progress.completedSections = progress.completedSections.filter(id => id !== sectionId)
      } else {
        checkbox.classList.add('completed')
        checkbox.innerHTML = '✅'
        tracker.markSectionComplete(path, sectionId, totalSections)
      }
      updateProgressDisplay()
    })

    section.insertAdjacentElement('afterbegin', checkbox)
  })

  // 重置按钮
  progressBar.querySelector('.progress-reset')?.addEventListener('click', () => {
    if (confirm('确定要重置此页面的学习进度吗？')) {
      tracker.resetProgress(path)
      location.reload()
    }
  })

  function updateProgressDisplay(): void {
    const rate = tracker.getCompletionRate(path)
    const percentEl = progressBar.querySelector('.progress-percent')
    const fillEl = progressBar.querySelector('.progress-fill')
    if (percentEl) percentEl.textContent = `${rate}%`
    if (fillEl) (fillEl as HTMLElement).style.width = `${rate}%`
  }
}

// Intersection Observer 自动标记可见章节
function initAutoMark(): void {
  if (!document.location.pathname.includes('/learning-paths/')) return

  const tracker = new LearningProgressTracker()
  const path = document.location.pathname
  const sections = document.querySelectorAll('.vp-doc h2, .vp-doc h3')
  const totalSections = sections.length

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = Array.from(sections).indexOf(entry.target as Element)
        const sectionId = `section-${index}`
        tracker.markSectionComplete(path, sectionId, totalSections)
      }
    })
  }, { threshold: 0.5 })

  sections.forEach(section => observer.observe(section))
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initProgressUI()
      initAutoMark()
    })
  } else {
    initProgressUI()
    initAutoMark()
  }

  window.addEventListener('popstate', () => {
    setTimeout(() => {
      initProgressUI()
      initAutoMark()
    }, 300)
  })
}
