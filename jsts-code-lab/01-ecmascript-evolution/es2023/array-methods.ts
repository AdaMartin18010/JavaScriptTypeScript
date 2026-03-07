/**
 * @file ES2023 数组新方法
 * @category ECMAScript Evolution → ES2023
 * @difficulty easy
 * @tags es2023, array, immutable, toSorted, toReversed
 */

// ============================================================================
// 1. toSorted - 不改变原数组的排序
// ============================================================================

const numbers = [3, 1, 4, 1, 5, 9, 2, 6];

// 旧方式：sort() 会修改原数组
const sortedOld = [...numbers].sort((a, b) => a - b);

// ES2023：toSorted() 返回新数组
const sortedNew = numbers.toSorted((a, b) => a - b);

console.log(numbers); // [3, 1, 4, 1, 5, 9, 2, 6] - 原数组未改变
console.log(sortedNew); // [1, 1, 2, 3, 4, 5, 6, 9]

// ============================================================================
// 2. toReversed - 不改变原数组的反转
// ============================================================================

const letters = ['a', 'b', 'c', 'd'];

// 旧方式
const reversedOld = [...letters].reverse();

// ES2023
const reversedNew = letters.toReversed();

console.log(letters); // ['a', 'b', 'c', 'd']
console.log(reversedNew); // ['d', 'c', 'b', 'a']

// ============================================================================
// 3. toSpliced - 不改变原数组的 splice
// ============================================================================

const items = ['a', 'b', 'c', 'd', 'e'];

// 旧方式：splice 会修改原数组
// const splicedOld = [...items];
// splicedOld.splice(2, 2, 'x', 'y');

// ES2023：toSpliced 返回新数组
const splicedNew = items.toSpliced(2, 2, 'x', 'y');

console.log(items); // ['a', 'b', 'c', 'd', 'e']
console.log(splicedNew); // ['a', 'b', 'x', 'y', 'e']

// 参数说明：
// toSpliced(start, deleteCount, ...items)
// - start: 开始位置
// - deleteCount: 删除的元素数量
// - items: 要插入的新元素

// ============================================================================
// 4. with - 不改变原数组的修改
// ============================================================================

const arr = [1, 2, 3, 4, 5];

// 旧方式
const replacedOld = [...arr];
replacedOld[2] = 99;

// ES2023
const replacedNew = arr.with(2, 99);

console.log(arr); // [1, 2, 3, 4, 5]
console.log(replacedNew); // [1, 2, 99, 4, 5]

// 负索引支持
const withNegative = arr.with(-1, 99); // 替换最后一个元素
console.log(withNegative); // [1, 2, 3, 4, 99]

// ============================================================================
// 5. findLast 和 findLastIndex
// ============================================================================

const nums = [5, 12, 8, 130, 44, 8];

// 从后往前查找
const lastMatch = nums.findLast(n => n > 10); // 44
const lastIndex = nums.findLastIndex(n => n > 10); // 4

// 对比 find 和 findIndex（从前往后）
const firstMatch = nums.find(n => n > 10); // 12
const firstIndex = nums.findIndex(n => n > 10); // 1

// ============================================================================
// 6. 不可变操作的优势
// ============================================================================

// React 中更安全的状态更新
function updateItemsReactStyle(items: string[], index: number, newValue: string) {
  // 之前
  // return items.map((item, i) => i === index ? newValue : item);
  
  // ES2023
  return items.with(index, newValue);
}

// Redux 风格的 reducer
interface State {
  items: number[];
  sortOrder: 'asc' | 'desc';
}

function reducer(state: State, action: { type: string }): State {
  switch (action.type) {
    case 'SORT_ASC':
      return {
        ...state,
        items: state.items.toSorted((a, b) => a - b),
        sortOrder: 'asc'
      };
    case 'SORT_DESC':
      return {
        ...state,
        items: state.items.toSorted((a, b) => b - a),
        sortOrder: 'desc'
      };
    default:
      return state;
  }
}

// ============================================================================
// 7. 链式操作
// ============================================================================

const data = [3, 1, 4, 1, 5, 9, 2, 6];

// 可以安全地链式调用
const result = data
  .toSorted((a, b) => a - b)
  .toReversed()
  .with(0, 999);

console.log('Original:', data); // 未改变
console.log('Result:', result); // [999, 9, 6, 5, 4, 3, 2, 1, 1]

// ============================================================================
// 8. 与 TypedArray 一起使用
// ============================================================================

const typedArray = new Int32Array([3, 1, 4, 1, 5]);

// TypedArray 也有这些方法
const sortedTyped = typedArray.toSorted();
console.log(sortedTyped); // Int32Array [1, 1, 3, 4, 5]

// ============================================================================
// 导出
// ============================================================================

export {
  updateItemsReactStyle,
  reducer
};

// 导出示例数据供测试
export { numbers, letters, items, arr, nums, data };
