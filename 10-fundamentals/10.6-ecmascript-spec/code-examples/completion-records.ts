/**
 * @file Completion Records 模拟
 * @category ECMAScript Spec Foundation → Completion Records
 * @difficulty hard
 * @tags completion-record, try-catch-finally, return-override, break, continue
 */

// ============================================================================
// 1. Completion Record 类型定义
// ============================================================================

type CompletionType = "normal" | "throw" | "return" | "break" | "continue";

interface CompletionRecord<T = unknown> {
  type: CompletionType;
  value?: T;
  target?: string; // 用于 break/continue 的 label
}

function NormalCompletion<T>(value?: T): CompletionRecord<T> {
  return { type: "normal", value };
}

function ThrowCompletion(reason: unknown): CompletionRecord<never> {
  return { type: "throw", value: reason as never };
}

function ReturnCompletion<T>(value: T): CompletionRecord<T> {
  return { type: "return", value };
}

function BreakCompletion(target?: string): CompletionRecord<never> {
  return { type: "break", target };
}

function ContinueCompletion(target?: string): CompletionRecord<never> {
  return { type: "continue", target };
}

function isAbruptCompletion(record: CompletionRecord): boolean {
  return record.type !== "normal";
}

// ============================================================================
// 2. 模拟 try/catch/finally 的执行
// ============================================================================

function simulateTryCatchFinally<T>(
  tryFn: () => CompletionRecord<T>,
  catchFn?: (reason: unknown) => CompletionRecord<T>,
  finallyFn?: () => CompletionRecord<T>
): CompletionRecord<T> {
  let result: CompletionRecord<T>;

  // Try 块
  try {
    result = tryFn();
  } catch (err) {
    // 如果 catch 存在，执行 catch
    if (catchFn) {
      try {
        result = catchFn(err);
      } catch (catchErr) {
        result = ThrowCompletion(catchErr) as CompletionRecord<T>;
      }
    } else {
      result = ThrowCompletion(err) as CompletionRecord<T>;
    }
  }

  // Finally 块
  if (finallyFn) {
    let finallyResult: CompletionRecord<T>;
    try {
      finallyResult = finallyFn();
    } catch (err) {
      finallyResult = ThrowCompletion(err) as CompletionRecord<T>;
    }

    // 关键语义：如果 finally 正常完成，保留之前的 result
    // 如果 finally 是 abrupt completion，用 finally 的结果覆盖
    if (isAbruptCompletion(finallyResult)) {
      result = finallyResult;
    }
    // 否则保留 try/catch 的 result
  }

  return result;
}

// ============================================================================
// 3. 各种 completion 演示
// ============================================================================

function demonstrateNormalCompletion(): void {
  console.log("--- 1. Normal Completion ---");

  const result = simulateTryCatchFinally(
    () => NormalCompletion("success")
  );
  console.log("正常完成:", result);
}

function demonstrateThrowCompletion(): void {
  console.log("\n--- 2. Throw Completion ---");

  const result = simulateTryCatchFinally(
    () => ThrowCompletion(new Error("oops")),
    (err) => {
      console.log("catch 捕获:", (err as Error).message);
      return NormalCompletion("recovered");
    }
  );
  console.log("捕获后完成:", result);
}

function demonstrateReturnCompletion(): void {
  console.log("\n--- 3. Return Completion ---");

  function inner(): CompletionRecord<number> {
    return simulateTryCatchFinally(
      () => {
        console.log("try 块执行");
        return ReturnCompletion(42);
      },
      undefined,
      () => {
        console.log("finally 块执行");
        return NormalCompletion();
      }
    );
  }

  const result = inner();
  console.log("return 结果:", result);
}

// ============================================================================
// 4. finally 覆盖 return 值（反例）
// ============================================================================

function demonstrateFinallyOverride(): void {
  console.log("\n--- 4. finally 覆盖 return 值 ---");

  function badFunction(): string {
    try {
      return "try return";
    } finally {
      return "finally return"; // ❌ 覆盖 try 的返回值
    }
  }

  function anotherBadFunction(): number {
    try {
      return 1;
    } finally {
      // 即使 finally 没有 return，throw 也会覆盖
      throw new Error("finally error");
    }
  }

  console.log("badFunction():", badFunction());
  try {
    console.log("anotherBadFunction():", anotherBadFunction());
  } catch (e) {
    console.log("finally 中的 throw 覆盖了 return:", (e as Error).message);
  }

  // 使用 Completion Record 模拟
  const simulated = simulateTryCatchFinally(
    () => ReturnCompletion("try value"),
    undefined,
    () => ReturnCompletion("finally value")
  );
  console.log("模拟 finally 覆盖:", simulated);
}

// ============================================================================
// 5. break/continue 模拟
// ============================================================================

function simulateBreakContinue(): void {
  console.log("\n--- 5. break/continue 模拟 ---");

  const items = ["a", "b", "c", "d"];
  const result: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const completion = ((): CompletionRecord<void> => {
      if (items[i] === "c") {
        return BreakCompletion();
      }
      result.push(items[i]);
      return NormalCompletion();
    })();

    if (completion.type === "break") break;
  }
  console.log("break 结果:", result);

  // continue
  result.length = 0;
  for (let i = 0; i < items.length; i++) {
    const completion = ((): CompletionRecord<void> => {
      if (items[i] === "b") {
        return ContinueCompletion();
      }
      result.push(items[i]);
      return NormalCompletion();
    })();

    if (completion.type === "break") break;
    if (completion.type === "continue") continue;
  }
  console.log("continue 结果:", result);
}

// ============================================================================
// 反例 (Counter-examples)
// ============================================================================

/** 反例 1: finally 中忘记 return 导致异常丢失 */
function counterExample1(): void {
  console.log("\n--- Counter-example 1: finally 吞掉异常 ---");

  function swallowError(): string {
    try {
      throw new Error("原始错误");
    } finally {
      // 没有重新抛出，错误被静默吞掉
      console.log("finally 执行，但错误被忽略了");
      return "safe value";
    }
  }

  console.log("swallowError():", swallowError());
  console.log("原始错误丢失了！");
}

/** 反例 2: async 函数中的 finally 与 return */
function counterExample2(): void {
  console.log("\n--- Counter-example 2: async finally 覆盖 ---");
  console.log(`
// ❌ finally 覆盖 await 的返回值
async function fetchData() {
  try {
    const data = await api.call();
    return data;
  } finally {
    cleanup();
    return null; // 覆盖了 data！
  }
}

// ✅ 正确：finally 只清理，不返回值
async function fetchDataSafe() {
  try {
    const data = await api.call();
    return data;
  } finally {
    cleanup(); // 只执行清理
  }
}
  `);
}

/** 反例 3: try/finally 与 return 对象的修改 */
function counterExample3(): void {
  console.log("--- Counter-example 3: return 引用类型的修改 ---");

  function returnObject(): { value: number } {
    const obj = { value: 1 };
    try {
      return obj;
    } finally {
      obj.value = 2; // 修改返回的对象
    }
  }

  const result = returnObject();
  console.log("returnObject():", result); // { value: 2 }
  console.log("finally 中修改了返回的引用对象！");
}

/** 反例 4: 嵌套 try/catch/finally 的复杂性 */
function counterExample4(): void {
  console.log("\n--- Counter-example 4: 嵌套 completion ---");

  function nested(): string {
    try {
      try {
        return "inner";
      } finally {
        console.log("inner finally");
        // inner finally 正常完成，保留 inner return
      }
    } finally {
      console.log("outer finally");
      // outer finally 正常完成，保留之前的 return
    }
  }

  console.log("nested():", nested());
}

/** 反例 5: for-of 中的 return 与 try/finally */
function counterExample5(): void {
  console.log("\n--- Counter-example 5: 生成器中的 finally ---");

  function* generator(): Generator<string, void, unknown> {
    try {
      yield "a";
      yield "b";
    } finally {
      console.log("生成器 finally 执行");
      yield "cleanup"; // 这个 yield 在 .return() 时会被执行
    }
  }

  const gen = generator();
  console.log("next():", gen.next());
  console.log("return():", gen.return("early exit" as never));
  console.log("next():", gen.next());
}

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Completion Records Demo ===\n");

  demonstrateNormalCompletion();
  demonstrateThrowCompletion();
  demonstrateReturnCompletion();
  demonstrateFinallyOverride();
  simulateBreakContinue();

  // 反例
  counterExample1();
  counterExample2();
  counterExample3();
  counterExample4();
  counterExample5();

  console.log("\n=== End of Completion Records Demo ===\n");
}

export {
  NormalCompletion,
  ThrowCompletion,
  ReturnCompletion,
  BreakCompletion,
  ContinueCompletion,
  isAbruptCompletion,
  simulateTryCatchFinally,
};
