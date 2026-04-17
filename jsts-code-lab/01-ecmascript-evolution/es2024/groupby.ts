/**
 * @file ES2024 Object.groupBy
 * @category ECMAScript Evolution → ES2024
 * @difficulty easy
 * @tags es2024, groupby, array, object
 */

// ============================================================================
// 1. Object.groupBy 基础
// ============================================================================

const products = [
  { name: 'Apple', category: 'fruit', price: 1.5 },
  { name: 'Banana', category: 'fruit', price: 0.5 },
  { name: 'Carrot', category: 'vegetable', price: 0.8 },
  { name: 'Broccoli', category: 'vegetable', price: 1.2 },
  { name: 'Chicken', category: 'meat', price: 5.0 }
];

// 按类别分组
const byCategory = Object.groupBy(products, p => p.category);

/*
{
  fruit: [
    { name: 'Apple', category: 'fruit', price: 1.5 },
    { name: 'Banana', category: 'fruit', price: 0.5 }
  ],
  vegetable: [...],
  meat: [...]
}
*/

// ============================================================================
// 2. Map.groupBy (支持任意类型的 key)
// ============================================================================

const byPriceRange = Map.groupBy(products, p => {
  if (p.price < 1) return 'cheap';
  if (p.price < 2) return 'moderate';
  return 'expensive';
});

/*
Map {
  'cheap' => [Banana, Carrot],
  'moderate' => [Apple, Broccoli],
  'expensive' => [Chicken]
}
*/

// ============================================================================
// 3. 与 reduce 对比
// ============================================================================

// 旧方式 (reduce)
const byCategoryOld = products.reduce<Record<string, typeof products>>((acc, product) => {
  const key = product.category;
  acc[key] ??= [];
  acc[key].push(product);
  return acc;
}, {});

// ES2024 方式
const byCategoryNew = Object.groupBy(products, p => p.category);

// ============================================================================
// 4. 实际应用场景
// ============================================================================

// 按状态分组任务
interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

const tasks: Task[] = [
  { id: '1', title: 'Task 1', status: 'pending', priority: 'high' },
  { id: '2', title: 'Task 2', status: 'in-progress', priority: 'medium' },
  { id: '3', title: 'Task 3', status: 'completed', priority: 'low' },
  { id: '4', title: 'Task 4', status: 'pending', priority: 'medium' }
];

// 按状态分组
const tasksByStatus = Object.groupBy(tasks, t => t.status);

// 按优先级分组
const tasksByPriority = Object.groupBy(tasks, t => t.priority);

// ============================================================================
// 5. 数据统计
// ============================================================================

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 按奇偶分组
const parityGroups = Object.groupBy(numbers, n => n % 2 === 0 ? 'even' : 'odd');
// { even: [2, 4, 6, 8, 10], odd: [1, 3, 5, 7, 9] }

// 按范围分组
const rangeGroups = Object.groupBy(numbers, n => {
  if (n <= 3) return 'small';
  if (n <= 7) return 'medium';
  return 'large';
});

// ============================================================================
// 6. 链式操作
// ============================================================================

// 分组后统计
function countBy<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
  const groups = Object.groupBy(items, keyFn);
  return Object.fromEntries(
    Object.entries(groups).map(([key, group]) => [key, group!.length])
  );
}

// 使用
const categoryCounts = countBy(products, p => p.category);
// { fruit: 2, vegetable: 2, meat: 1 }

// ============================================================================
// 7. 复杂分组逻辑
// ============================================================================

interface Employee {
  name: string;
  department: string;
  salary: number;
  joinDate: Date;
}

const employees: Employee[] = [
  { name: 'Alice', department: 'Engineering', salary: 80000, joinDate: new Date('2020-01-15') },
  { name: 'Bob', department: 'Engineering', salary: 90000, joinDate: new Date('2019-06-20') },
  { name: 'Carol', department: 'Sales', salary: 70000, joinDate: new Date('2021-03-10') },
  { name: 'David', department: 'HR', salary: 60000, joinDate: new Date('2022-01-05') }
];

// 多条件分组
const byDeptAndSalary = Object.groupBy(employees, e => {
  const salaryLevel = e.salary >= 80000 ? 'senior' : 'junior';
  return `${e.department}-${salaryLevel}`;
});

// 按入职年份分组
const byYear = Object.groupBy(employees, e => 
  e.joinDate.getFullYear().toString()
);

// ============================================================================
// 导出
// ============================================================================

export {
  products,
  byCategory,
  byPriceRange,
  byCategoryOld,
  byCategoryNew,
  tasks,
  tasksByStatus,
  tasksByPriority,
  numbers,
  parityGroups,
  rangeGroups,
  countBy,
  employees,
  byDeptAndSalary,
  byYear
};

export type { Task, Employee };
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Object.groupBy Demo ===");
  
  // 按类别分组产品
  console.log("By category:", Object.keys(byCategory));
  
  // 按价格范围分组
  console.log("By price range:", Array.from(byPriceRange.keys()));
  
  // 任务分组
  console.log("Tasks by status:", Object.keys(tasksByStatus));
  console.log("Tasks by priority:", Object.keys(tasksByPriority));
  
  // 奇偶分组
  console.log("Parity groups:", Object.keys(parityGroups));
  console.log("Even numbers:", parityGroups.even);
  console.log("Odd numbers:", parityGroups.odd);
  
  // 统计
  const counts = countBy(products, p => p.category);
  console.log("Category counts:", counts);
  
  // 按部门分组员工
  console.log("By department:", Object.keys(byYear));
  
  console.log("=== End of Demo ===\n");
}
