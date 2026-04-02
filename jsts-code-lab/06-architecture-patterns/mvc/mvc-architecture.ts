/**
 * @file MVC 架构 (Model-View-Controller)
 * @category Architecture Patterns → MVC
 * @difficulty medium
 * @tags architecture, mvc, separation-of-concerns, ui-pattern
 * 
 * @description
 * MVC 是一种经典的软件架构模式，将应用分为三个核心组件：
 * - Model: 数据模型和业务逻辑
 * - View: 用户界面展示
 * - Controller: 处理用户输入，协调 Model 和 View
 */

// ============================================================================
// 1. Model 层 - 数据模型和业务逻辑
// ============================================================================

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export class TaskModel {
  private tasks: Map<string, Task> = new Map();
  private listeners: Array<(tasks: Task[]) => void> = [];

  // 添加任务
  addTask(title: string): Task {
    const task: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      completed: false,
      createdAt: new Date()
    };
    this.tasks.set(task.id, task);
    this.notify();
    return task;
  }

  // 切换任务完成状态
  toggleTask(id: string): Task | null {
    const task = this.tasks.get(id);
    if (task) {
      task.completed = !task.completed;
      this.notify();
      return task;
    }
    return null;
  }

  // 删除任务
  deleteTask(id: string): boolean {
    const deleted = this.tasks.delete(id);
    if (deleted) this.notify();
    return deleted;
  }

  // 获取所有任务
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // 获取已完成任务
  getCompletedTasks(): Task[] {
    return this.getAllTasks().filter(t => t.completed);
  }

  // 获取待办任务
  getPendingTasks(): Task[] {
    return this.getAllTasks().filter(t => !t.completed);
  }

  // 订阅数据变化
  subscribe(listener: (tasks: Task[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  private notify(): void {
    const tasks = this.getAllTasks();
    this.listeners.forEach(listener => listener(tasks));
  }
}

// ============================================================================
// 2. View 层 - 用户界面 (控制台模拟)
// ============================================================================

export interface TaskView {
  displayTasks(tasks: Task[]): void;
  displayTaskAdded(task: Task): void;
  displayTaskToggled(task: Task): void;
  displayTaskDeleted(id: string): void;
  displayError(message: string): void;
  displayStats(total: number, completed: number, pending: number): void;
}

// 控制台视图实现
export class ConsoleTaskView implements TaskView {
  displayTasks(tasks: Task[]): void {
    console.log('\n=== 任务列表 ===');
    if (tasks.length === 0) {
      console.log('暂无任务');
      return;
    }
    tasks.forEach(task => {
      const status = task.completed ? '✓' : '○';
      console.log(`${status} [${task.id}] ${task.title}`);
    });
  }

  displayTaskAdded(task: Task): void {
    console.log(`✓ 任务已添加: ${task.title}`);
  }

  displayTaskToggled(task: Task): void {
    const status = task.completed ? '已完成' : '未完成';
    console.log(`✓ 任务 "${task.title}" 标记为${status}`);
  }

  displayTaskDeleted(id: string): void {
    console.log(`✓ 任务 [${id}] 已删除`);
  }

  displayError(message: string): void {
    console.error(`✗ 错误: ${message}`);
  }

  displayStats(total: number, completed: number, pending: number): void {
    console.log(`\n=== 统计 ===`);
    console.log(`总计: ${total} | 已完成: ${completed} | 待办: ${pending}`);
  }
}

// ============================================================================
// 3. Controller 层 - 业务逻辑协调
// ============================================================================

export class TaskController {
  constructor(
    private model: TaskModel,
    private view: TaskView
  ) {
    // 订阅模型变化，自动更新视图
    this.model.subscribe((tasks) => {
      this.view.displayTasks(tasks);
      this.updateStats();
    });
  }

  // 处理添加任务
  handleAddTask(title: string): void {
    if (!title.trim()) {
      this.view.displayError('任务标题不能为空');
      return;
    }
    const task = this.model.addTask(title);
    this.view.displayTaskAdded(task);
  }

  // 处理切换任务状态
  handleToggleTask(id: string): void {
    const task = this.model.toggleTask(id);
    if (task) {
      this.view.displayTaskToggled(task);
    } else {
      this.view.displayError(`任务 ${id} 不存在`);
    }
  }

  // 处理删除任务
  handleDeleteTask(id: string): void {
    const deleted = this.model.deleteTask(id);
    if (deleted) {
      this.view.displayTaskDeleted(id);
    } else {
      this.view.displayError(`任务 ${id} 不存在`);
    }
  }

  // 显示所有任务
  handleShowAll(): void {
    const tasks = this.model.getAllTasks();
    this.view.displayTasks(tasks);
    this.updateStats();
  }

  // 显示已完成任务
  handleShowCompleted(): void {
    const tasks = this.model.getCompletedTasks();
    this.view.displayTasks(tasks);
  }

  // 显示待办任务
  handleShowPending(): void {
    const tasks = this.model.getPendingTasks();
    this.view.displayTasks(tasks);
  }

  private updateStats(): void {
    const all = this.model.getAllTasks();
    const completed = all.filter(t => t.completed).length;
    this.view.displayStats(all.length, completed, all.length - completed);
  }
}

// ============================================================================
// 4. 使用示例
// ============================================================================

export function demo(): void {
  const model = new TaskModel();
  const view = new ConsoleTaskView();
  const controller = new TaskController(model, view);

  console.log('=== MVC 架构演示 ===\n');

  // 添加任务
  controller.handleAddTask('学习 TypeScript');
  controller.handleAddTask('完成架构设计');
  controller.handleAddTask('编写单元测试');

  // 显示所有任务
  controller.handleShowAll();

  // 完成任务
  const tasks = model.getAllTasks();
  if (tasks[0]) {
    controller.handleToggleTask(tasks[0].id);
  }

  // 显示已完成
  controller.handleShowCompleted();

  // 删除任务
  if (tasks[1]) {
    controller.handleDeleteTask(tasks[1].id);
  }

  // 最终状态
  controller.handleShowAll();
}

// (已在上文使用 export class / export interface 直接导出，此处无需重复导出)
