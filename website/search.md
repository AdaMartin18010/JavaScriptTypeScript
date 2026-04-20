# 🔍 增强搜索

> 基于文档元数据的增强搜索中心。支持按分类、难度、模块类型筛选。

<script setup>
import { ref, computed, onMounted } from 'vue'

const query = ref('')
const selectedCategory = ref('all')
const selectedDifficulty = ref('all')

// 文档索引（由构建时生成）
const docsIndex = ref([])

onMounted(async () => {
  // 尝试加载搜索索引
  try {
    const res = await fetch('/search-index.json')
    if (res.ok) {
      docsIndex.value = await res.json()
    }
  } catch {
    // 回退到静态列表
    docsIndex.value = [
      { title: '前端框架对比', path: '/comparison-matrices/frontend-frameworks-compare', category: '对比矩阵', difficulty: 'medium', tags: ['frontend', 'framework'] },
      { title: 'AI SDK 指南', path: '/guide/ai-sdk-guide', category: '指南', difficulty: 'medium', tags: ['ai', 'sdk'] },
      { title: 'MCP 协议指南', path: '/guide/mcp-guide', category: '指南', difficulty: 'hard', tags: ['ai', 'mcp', 'protocol'] },
      { title: 'WebAssembly 指南', path: '/guide/webassembly-guide', category: '指南', difficulty: 'hard', tags: ['wasm', 'performance'] },
      { title: '后端框架对比', path: '/comparison-matrices/backend-frameworks-compare', category: '对比矩阵', difficulty: 'medium', tags: ['backend', 'framework'] },
      { title: 'AI 工具对比', path: '/comparison-matrices/ai-tools-compare', category: '对比矩阵', difficulty: 'medium', tags: ['ai', 'tools'] },
      { title: '代码实验室首页', path: '/code-lab/', category: '代码实验室', difficulty: 'all', tags: ['lab', 'code'] },
      { title: '初学者路径', path: '/learning-paths/beginners-path', category: '学习路径', difficulty: 'easy', tags: ['beginner'] },
      { title: '进阶者路径', path: '/learning-paths/intermediate-path', category: '学习路径', difficulty: 'medium', tags: ['intermediate'] },
      { title: '高级路径', path: '/learning-paths/advanced-path', category: '学习路径', difficulty: 'hard', tags: ['advanced'] },
    ]
  }
})

const categories = computed(() => {
  const cats = new Set(docsIndex.value.map(d => d.category))
  return ['all', ...Array.from(cats)]
})

const difficulties = ['all', 'easy', 'medium', 'hard']

const filteredDocs = computed(() => {
  return docsIndex.value.filter(doc => {
    const matchQuery = !query.value ||
      doc.title.toLowerCase().includes(query.value.toLowerCase()) ||
      doc.tags.some(t => t.toLowerCase().includes(query.value.toLowerCase()))
    const matchCategory = selectedCategory.value === 'all' || doc.category === selectedCategory.value
    const matchDifficulty = selectedDifficulty.value === 'all' || doc.difficulty === selectedDifficulty.value
    return matchQuery && matchCategory && matchDifficulty
  })
})
</script>

<div class="search-container">
  <div class="search-filters">
    <input
      v-model="query"
      class="search-input"
      placeholder="搜索文档、标签..."
    />
    <select v-model="selectedCategory" class="search-select">
      <option v-for="cat in categories" :key="cat" :value="cat">
        {{ cat === 'all' ? '所有分类' : cat }}
      </option>
    </select>
    <select v-model="selectedDifficulty" class="search-select">
      <option value="all">所有难度</option>
      <option value="easy">入门</option>
      <option value="medium">进阶</option>
      <option value="hard">高级</option>
    </select>
  </div>

  <div class="search-results">
    <div v-if="filteredDocs.length === 0" class="search-empty">
      未找到匹配的文档
    </div>
    <a
      v-for="doc in filteredDocs"
      :key="doc.path"
      :href="doc.path"
      class="search-result-card"
    >
      <div class="result-header">
        <span class="result-title">{{ doc.title }}</span>
        <span class="result-category">{{ doc.category }}</span>
      </div>
      <div class="result-tags">
        <span v-for="tag in doc.tags" :key="tag" class="result-tag">{{ tag }}</span>
      </div>
    </a>
  </div>
</div>

<style scoped>
.search-container {
  margin-top: 2rem;
}

.search-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.search-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 1rem;
  cursor: pointer;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.search-result-card {
  padding: 1rem 1.25rem;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.search-result-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateX(4px);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.result-title {
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--vp-c-text-1);
}

.result-category {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.result-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.result-tag {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
}

.search-empty {
  text-align: center;
  padding: 3rem;
  color: var(--vp-c-text-2);
}
</style>
