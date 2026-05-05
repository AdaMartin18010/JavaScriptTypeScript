const STORAGE_KEY = "jsts-learning-progress";
class LearningProgressTracker {
  constructor() {
    this.data = {};
    this.load();
  }
  load() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.data = JSON.parse(raw);
    } catch {
      this.data = {};
    }
  }
  save() {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }
  getProgress(path) {
    return this.data[path] ?? { completedSections: [], lastVisited: "", totalSections: 0 };
  }
  markSectionComplete(path, sectionId, totalSections) {
    if (!this.data[path]) {
      this.data[path] = { completedSections: [], lastVisited: sectionId, totalSections };
    }
    if (!this.data[path].completedSections.includes(sectionId)) {
      this.data[path].completedSections.push(sectionId);
    }
    this.data[path].lastVisited = sectionId;
    this.data[path].totalSections = totalSections;
    this.save();
  }
  getCompletionRate(path) {
    const progress = this.getProgress(path);
    if (progress.totalSections === 0) return 0;
    return Math.round(progress.completedSections.length / progress.totalSections * 100);
  }
  resetProgress(path) {
    delete this.data[path];
    this.save();
  }
  resetAll() {
    this.data = {};
    this.save();
  }
}
function initProgressUI() {
  var _a;
  if (!document.location.pathname.includes("/learning-paths/")) return;
  const tracker = new LearningProgressTracker();
  const path = document.location.pathname;
  const progress = tracker.getProgress(path);
  const sections = document.querySelectorAll(".vp-doc h2, .vp-doc h3");
  const totalSections = sections.length;
  const progressBar = document.createElement("div");
  progressBar.className = "learning-progress-bar";
  progressBar.innerHTML = `
    <div class="progress-info">
      <span class="progress-label">学习进度</span>
      <span class="progress-percent">${tracker.getCompletionRate(path)}%</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill" style="width: ${tracker.getCompletionRate(path)}%"></div>
    </div>
    <button class="progress-reset">重置进度</button>
  `;
  const firstHeading = document.querySelector(".vp-doc h1");
  if (firstHeading) {
    firstHeading.insertAdjacentElement("afterend", progressBar);
  }
  sections.forEach((section, index) => {
    const sectionId = `section-${index}`;
    const isCompleted = progress.completedSections.includes(sectionId);
    const checkbox = document.createElement("span");
    checkbox.className = `section-check ${isCompleted ? "completed" : ""}`;
    checkbox.innerHTML = isCompleted ? "✅" : "⬜";
    checkbox.title = isCompleted ? "标记为未完成" : "标记为已完成";
    checkbox.style.cssText = "cursor:pointer;margin-right:8px;font-size:1.2em;user-select:none;";
    checkbox.addEventListener("click", () => {
      const completed = checkbox.classList.contains("completed");
      if (completed) {
        checkbox.classList.remove("completed");
        checkbox.innerHTML = "⬜";
        progress.completedSections = progress.completedSections.filter((id) => id !== sectionId);
      } else {
        checkbox.classList.add("completed");
        checkbox.innerHTML = "✅";
        tracker.markSectionComplete(path, sectionId, totalSections);
      }
      updateProgressDisplay();
    });
    section.insertAdjacentElement("afterbegin", checkbox);
  });
  (_a = progressBar.querySelector(".progress-reset")) == null ? void 0 : _a.addEventListener("click", () => {
    if (confirm("确定要重置此页面的学习进度吗？")) {
      tracker.resetProgress(path);
      location.reload();
    }
  });
  function updateProgressDisplay() {
    const rate = tracker.getCompletionRate(path);
    const percentEl = progressBar.querySelector(".progress-percent");
    const fillEl = progressBar.querySelector(".progress-fill");
    if (percentEl) percentEl.textContent = `${rate}%`;
    if (fillEl) fillEl.style.width = `${rate}%`;
  }
}
function initAutoMark() {
  if (!document.location.pathname.includes("/learning-paths/")) return;
  const tracker = new LearningProgressTracker();
  const path = document.location.pathname;
  const sections = document.querySelectorAll(".vp-doc h2, .vp-doc h3");
  const totalSections = sections.length;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = Array.from(sections).indexOf(entry.target);
        const sectionId = `section-${index}`;
        tracker.markSectionComplete(path, sectionId, totalSections);
      }
    });
  }, { threshold: 0.5 });
  sections.forEach((section) => observer.observe(section));
}
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initProgressUI();
      initAutoMark();
    });
  } else {
    initProgressUI();
    initAutoMark();
  }
  window.addEventListener("popstate", () => {
    setTimeout(() => {
      initProgressUI();
      initAutoMark();
    }, 300);
  });
}
export {
  LearningProgressTracker
};
