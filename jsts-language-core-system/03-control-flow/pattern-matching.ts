/**
 * @file 模式匹配（Pattern Matching Simulation）
 * @category Language Core → Control Flow
 * @difficulty warm
 * @tags pattern-matching, discriminated-union, exhaustive-switch, destructuring, narrowing
 *
 * @description
 * 使用当前 TypeScript 特性模拟 TC39 Stage 1 模式匹配提案：
 * - 可辨识联合 + 穷尽性 switch
 * - 对象形状匹配（解构 + 守卫）
 * - 数组解构模式
 * 包含非穷尽 switch 的反例演示。
 */

// ============================================================================
// 1. 可辨识联合与穷尽性 switch
// ============================================================================

interface Circle {
  kind: 'circle';
  radius: number;
}

interface Square {
  kind: 'square';
  size: number;
}

interface Triangle {
  kind: 'triangle';
  base: number;
  height: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

type Shape = Circle | Square | Triangle | Rectangle;

/** ✅ 穷尽性 switch：TypeScript 编译器验证所有分支 */
function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.size ** 2;
    case 'triangle':
      return (shape.base * shape.height) / 2;
    case 'rectangle':
      return shape.width * shape.height;
    default:
      // 穷尽性检查：若添加新 Shape 成员未处理，此处编译报错
      const _exhaustive: never = shape;
      throw new Error(`Unhandled shape: ${_exhaustive}`);
  }
}

// ============================================================================
// 2. 对象形状匹配（解构 + 守卫）
// ============================================================================

interface Point {
  x: number;
  y: number;
}

interface Line {
  start: Point;
  end: Point;
}

interface Polygon {
  vertices: Point[];
}

type Geometry = Point | Line | Polygon;

/** ✅ 基于形状的模式匹配 */
function describeGeometry(geo: Geometry): string {
  // 检查是否为 Point（有 x/y 无 vertices/start）
  if ('x' in geo && 'y' in geo && !('vertices' in geo) && !('start' in geo)) {
    const { x, y } = geo as Point;
    return `Point(${x}, ${y})`;
  }

  // 检查是否为 Line
  if ('start' in geo && 'end' in geo) {
    const { start, end } = geo as Line;
    return `Line((${start.x},${start.y}) → (${end.x},${end.y}))`;
  }

  // 检查是否为 Polygon
  if ('vertices' in geo) {
    const { vertices } = geo as Polygon;
    return `Polygon[${vertices.length} vertices]`;
  }

  return 'Unknown geometry';
}

/** ✅ 嵌套对象解构匹配 */
function matchNestedObject(obj: unknown): string {
  if (
    typeof obj === 'object' &&
    obj !== null &&
    'user' in obj &&
    typeof (obj as Record<string, unknown>).user === 'object' &&
    (obj as Record<string, unknown>).user !== null &&
    'profile' in (obj as Record<string, unknown>).user &&
    typeof ((obj as Record<string, unknown>).user as Record<string, unknown>).profile === 'object' &&
    ((obj as Record<string, unknown>).user as Record<string, unknown>).profile !== null &&
    'name' in ((obj as Record<string, unknown>).user as Record<string, unknown>).profile
  ) {
    const {
      user: {
        profile: { name }
      }
    } = obj as { user: { profile: { name: string } } };
    return `User name: ${name}`;
  }
  return 'No match';
}

// ============================================================================
// 3. 数组解构模式
// ============================================================================

/** ✅ 匹配空数组 */
function matchArrayPattern(arr: number[]): string {
  if (arr.length === 0) return 'empty';
  if (arr.length === 1) return `single: ${arr[0]}`;
  if (arr.length === 2) {
    const [a, b] = arr;
    return `pair: (${a}, ${b})`;
  }
  const [head, ...tail] = arr;
  return `head: ${head}, tail: [${tail.join(', ')}]`;
}

/** ✅ 元组模式匹配 */
function matchTuple(value: [string, number] | [string, number, boolean]): string {
  const [label, count] = value;
  if (value.length === 2) {
    return `Pair: ${label}=${count}`;
  }
  const [, , active] = value;
  return `Triple: ${label}=${count}, active=${active}`;
}

/** ✅ 数组元素形状匹配 */
function matchArrayOfShapes(shapes: Shape[]): string {
  if (shapes.length === 0) return 'no shapes';

  const [first, ...rest] = shapes;

  // 匹配特定第一个元素的模式
  if (first.kind === 'circle' && first.radius === 0) {
    return `degenerate circle + ${rest.length} more`;
  }

  if (first.kind === 'square' && rest.every(s => s.kind === 'square')) {
    return `all squares (${shapes.length})`;
  }

  return `mixed shapes (${shapes.length})`;
}

// ============================================================================
// 4. 带守卫的模式匹配
// ============================================================================

type Action =
  | { type: 'increment'; payload: number }
  | { type: 'decrement'; payload: number }
  | { type: 'reset' }
  | { type: 'set'; payload: number };

/** ✅ 带守卫的 reducer（模拟 when 子句） */
function reducer(state: number, action: Action): number {
  switch (action.type) {
    case 'increment': {
      if (action.payload < 0) return state; // 守卫条件
      return state + action.payload;
    }
    case 'decrement': {
      if (action.payload < 0) return state; // 守卫条件
      return state - action.payload;
    }
    case 'reset':
      return 0;
    case 'set':
      return action.payload;
    default: {
      const _exhaustive: never = action;
      throw new Error(`Unknown action: ${_exhaustive}`);
    }
  }
}

// ============================================================================
// 5. 反例：非穷尽 switch
// ============================================================================

/** ❌ 反例：遗漏 Rectangle 分支，但此处不会编译报错因为 default 存在 */
function badNonExhaustive(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.size ** 2;
    case 'triangle':
      return (shape.base * shape.height) / 2;
    // ❌ 遗漏了 rectangle！
    default:
      // 没有使用 never 进行穷尽检查，编译器无法发现遗漏
      return 0;
  }
}

/** ❌ 反例：使用 if 链而非 switch，容易遗漏分支 */
function badIfChain(shape: Shape): number {
  if (shape.kind === 'circle') {
    return Math.PI * shape.radius ** 2;
  } else if (shape.kind === 'square') {
    return shape.size ** 2;
  } else if (shape.kind === 'triangle') {
    return (shape.base * shape.height) / 2;
  }
  // ❌ 遗漏了 rectangle，但 TS 不会报错（返回 undefined 可赋值给 number 时不严格检查）
  // 在 strictNullChecks 下会报错，但逻辑错误仍然存在
  return 0;
}

/** ✅ 正例：使用 never 辅助变量强制穷尽检查 */
function goodExhaustive(shape: Shape): number {
  if (shape.kind === 'circle') return Math.PI * shape.radius ** 2;
  if (shape.kind === 'square') return shape.size ** 2;
  if (shape.kind === 'triangle') return (shape.base * shape.height) / 2;
  if (shape.kind === 'rectangle') return shape.width * shape.height;

  // ✅ 若遗漏任何分支，shape 类型不会收窄为 never，编译报错
  const _exhaustive: never = shape;
  return _exhaustive;
}

// ============================================================================
// 6. 模拟 match 表达式（函数式风格）
// ============================================================================

/** ✅ 使用对象映射表模拟 match（适用于简单值） */
const colorMap: Record<string, string> = {
  red: '#ff0000',
  green: '#00ff00',
  blue: '#0000ff'
};

function matchColor(name: string): string {
  return colorMap[name] ?? '#000000';
}

/** ✅ 使用函数映射表模拟 match（适用于复杂模式） */
const shapeHandlers: Record<Shape['kind'], (s: Shape) => number> = {
  circle: s => Math.PI * (s as Circle).radius ** 2,
  square: s => (s as Square).size ** 2,
  triangle: s => ((s as Triangle).base * (s as Triangle).height) / 2,
  rectangle: s => (s as Rectangle).width * (s as Rectangle).height
};

function areaViaMap(shape: Shape): number {
  return shapeHandlers[shape.kind](shape);
}

// ============================================================================
// 导出
// ============================================================================

export {
  area,
  describeGeometry,
  matchNestedObject,
  matchArrayPattern,
  matchTuple,
  matchArrayOfShapes,
  reducer,
  badNonExhaustive,
  badIfChain,
  goodExhaustive,
  matchColor,
  areaViaMap
};

export type { Shape, Point, Line, Polygon, Geometry, Action, Circle, Square, Triangle, Rectangle };

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log('=== Pattern Matching Simulation Demo ===\n');

  console.log('--- 可辨识联合 + 穷尽性 switch ---');
  const shapes: Shape[] = [
    { kind: 'circle', radius: 3 },
    { kind: 'square', size: 4 },
    { kind: 'triangle', base: 4, height: 5 },
    { kind: 'rectangle', width: 3, height: 6 }
  ];
  shapes.forEach(s => console.log(`  area(${s.kind}):`, area(s).toFixed(2)));

  console.log('\n--- 对象形状匹配 ---');
  console.log('Point:', describeGeometry({ x: 1, y: 2 }));
  console.log('Line:', describeGeometry({ start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }));
  console.log('Polygon:', describeGeometry({ vertices: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }] }));
  console.log('Nested:', matchNestedObject({ user: { profile: { name: 'Alice' } } }));

  console.log('\n--- 数组解构模式 ---');
  console.log('[]:', matchArrayPattern([]));
  console.log('[42]:', matchArrayPattern([42]));
  console.log('[1, 2]:', matchArrayPattern([1, 2]));
  console.log('[1, 2, 3, 4]:', matchArrayPattern([1, 2, 3, 4]));
  console.log('Tuple 2:', matchTuple(['count', 5]));
  console.log('Tuple 3:', matchTuple(['count', 5, true]));
  console.log('Array of shapes:', matchArrayOfShapes([{ kind: 'square', size: 2 }, { kind: 'square', size: 3 }]));

  console.log('\n--- 带守卫的 reducer ---');
  let state = 10;
  state = reducer(state, { type: 'increment', payload: 5 });
  console.log('  after increment 5:', state); // 15
  state = reducer(state, { type: 'decrement', payload: -3 });
  console.log('  after decrement -3 (guarded):', state); // 15（守卫阻止负数）
  state = reducer(state, { type: 'reset' });
  console.log('  after reset:', state); // 0

  console.log('\n--- 反例：非穷尽处理 ---');
  console.log('badNonExhaustive(rectangle):', badNonExhaustive({ kind: 'rectangle', width: 3, height: 4 })); // 0（错误！）
  console.log('goodExhaustive(rectangle):', goodExhaustive({ kind: 'rectangle', width: 3, height: 4 })); // 12

  console.log('\n--- 函数式 match 模拟 ---');
  console.log('matchColor("red"):', matchColor('red'));
  console.log('matchColor("unknown"):', matchColor('unknown'));
  console.log('areaViaMap(circle):', areaViaMap({ kind: 'circle', radius: 2 }).toFixed(2));

  console.log('\n=== End of Demo ===\n');
}
