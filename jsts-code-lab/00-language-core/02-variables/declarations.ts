/**
 * @file 变量声明对比: var, let, const
 * @category Language Core → Variables
 * @see ../../../JSTS全景综述/01_language_core.md#变量系统
 * @difficulty warm
 * @tags variables, scope, hoisting, es6
 * 
 * @description
 * var (ES3) vs let/const (ES6) 的核心差异
 */

// ============================================================================
// 1. 作用域 (Scope) 对比
// ============================================================================

console.log('=== 1. 作用域对比 ===');

/** var: 函数作用域 */
function varScopeDemo() {
  if (true) {
    var x = 10;
  }
  console.log('var x:', x); // ✅ 10 - 可以在 if 外访问
}
varScopeDemo();

/** let/const: 块级作用域 */
function letScopeDemo() {
  if (true) {
    let y = 20;
    const z = 30;
    console.log('inside block:', y, z); // ✅
  }
  // console.log(y); // ❌ ReferenceError
  // console.log(z); // ❌ ReferenceError
}
letScopeDemo();

// ============================================================================
// 2. 变量提升 (Hoisting) 对比
// ============================================================================

console.log('\n=== 2. 变量提升对比 ===');

/** var: 声明提升，初始化为 undefined */
console.log('varBefore:', varBefore); // undefined (不是 ReferenceError!)
var varBefore = 'I am hoisted';

/** let/const: 声明提升，但处于 TDZ (暂时性死区) */
// console.log(letBefore); // ❌ ReferenceError: Cannot access 'letBefore' before initialization
let letBefore = 'I am in TDZ';

// const constBefore = 'same as let'; // 同样会报错

/** 函数声明 vs 函数表达式 */
funcDeclaration(); // ✅ 函数声明完全提升
function funcDeclaration() {
  console.log('Function declaration works');
}

// funcExpression(); // ❌ TypeError: funcExpression is not a function
var funcExpression = function() {
  console.log('Function expression is hoisted as undefined');
};

// ============================================================================
// 3. 暂时性死区 (Temporal Dead Zone - TDZ)
// ============================================================================

console.log('\n=== 3. TDZ 演示 ===');

function tdzDemo() {
  // 从函数开始到 let 声明之间的区域就是 TDZ
  // console.log(value); // ❌ TDZ 错误
  
  let value = 'now I am defined';
  console.log('value:', value); // ✅
}
tdzDemo();

/** TDZ 与 typeof 的陷阱 */
function tdzTypeof() {
  // 在 TDZ 中 typeof 也会报错
  // typeof notDeclaredVar; // ❌ ReferenceError (unlike var which returns 'undefined')
  
  let notDeclaredVar = 'anything';
}

/** 暂时性死区的实际影响 */
function tdzPractical() {
  const funcs = [];
  
  for (let i = 0; i < 3; i++) {
    funcs.push(() => i);
  }
  
  // 每个闭包捕获的是不同的 i 值
  console.log('closures with let:', funcs.map(f => f())); // [0, 1, 2]
}
tdzPractical();

function varClosureProblem() {
  const funcs = [];
  
  for (var i = 0; i < 3; i++) {
    funcs.push(() => i);
  }
  
  // 所有闭包共享同一个 i
  console.log('closures with var:', funcs.map(f => f())); // [3, 3, 3]
}
varClosureProblem();

// ============================================================================
// 4. 重复声明
// ============================================================================

console.log('\n=== 4. 重复声明 ===');

/** var: 允许重复声明 */
var duplicate = 'first';
var duplicate = 'second'; // ✅ 静默覆盖
console.log('var duplicate:', duplicate);

/** let/const: 禁止重复声明 */
let unique = 'first';
// let unique = 'second'; // ❌ SyntaxError: Identifier 'unique' has already been declared

// 但可以在不同块级作用域中声明
function blockScopedReDeclaration() {
  let x = 'outer';
  {
    let x = 'inner'; // ✅ 不同的作用域
    console.log('inner x:', x);
  }
  console.log('outer x:', x);
}
blockScopedReDeclaration();

// ============================================================================
// 5. const 的不可变性
// ============================================================================

console.log('\n=== 5. const 不可变性 ===');

/** const 绑定不可变，值可能可变 */
const primitive = 'I am constant';
// primitive = 'cannot change'; // ❌ TypeError: Assignment to constant variable

const obj = { name: 'Alice' };
obj.name = 'Bob'; // ✅ 可以修改对象属性
// obj = {}; // ❌ 不能重新赋值

const arr = [1, 2, 3];
arr.push(4); // ✅ 可以修改数组
// arr = []; // ❌ 不能重新赋值

/** 真正不可变需要 Object.freeze (浅冻结) */
const frozen = Object.freeze({ name: 'Alice', nested: { value: 1 } });
// frozen.name = 'Bob'; // ❌ 严格模式下报错 (静默失败非严格模式)
frozen.nested.value = 2; // ✅ 嵌套对象仍可修改！(浅冻结)

// ============================================================================
// 6. 全局对象绑定
// ============================================================================

console.log('\n=== 6. 全局对象绑定 ===');

/** var 在全局作用域会成为全局对象的属性 */
// var globalVar = 'I am on globalThis';
// console.log(globalThis.globalVar); // 'I am on globalThis'

/** let/const 不会污染全局对象 */
// let globalLet = 'I am NOT on globalThis';
// console.log(globalThis.globalLet); // undefined

// ============================================================================
// 7. 最佳实践与建议
// ============================================================================

console.log('\n=== 7. 最佳实践 ===');

/** 默认使用 const */
const PI = 3.14159;
const CONFIG = { apiUrl: 'https://api.example.com' };

/** 需要重新赋值时使用 let */
let counter = 0;
counter++;

/** 避免使用 var */
// ❌ var oldStyle = 'deprecated';
// ✅ const newStyle = 'preferred';

/** 解构声明 */
const [first, second] = [1, 2];
const { name, age } = { name: 'Alice', age: 30 };

/** 在 for 循环中 */
// for-in: 遍历对象的键
const person = { name: 'Alice', age: 30 };
for (const key in person) {
  console.log(key, person[key as keyof typeof person]);
}

// for-of: 遍历可迭代对象的值
for (const num of [1, 2, 3]) {
  console.log(num);
}

// ============================================================================
// 导出
// ============================================================================

export {
  varScopeDemo,
  letScopeDemo,
  tdzDemo,
  blockScopedReDeclaration
};
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Variable Declarations Demo ===");
  
  // var vs let 作用域
  varScopeDemo();
  letScopeDemo();
  
  // TDZ 演示
  tdzDemo();
  
  // 块级作用域重新声明
  blockScopedReDeclaration();
  
  // const 不可变性
  const arr = [1, 2, 3];
  arr.push(4);
  console.log("Const array (can modify contents):", arr);
  
  // 解构
  const [a, b] = [10, 20];
  console.log("Destructured:", { a, b });
  
  console.log("=== End of Demo ===\n");
}
