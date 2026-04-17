/**
 * @file 双轨动态规划：JS 动态类型版 vs TS 严格类型版
 * @category JS/TS Comparison → Dual-Track Algorithms
 */

// ============================================================================
// JS 版：0/1 背包问题 — 动态规划，参数无类型
// ============================================================================

export function jsKnapsack(weights: any[], values: any[], capacity: any): number {
  const n = weights.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const w = Number(weights[i - 1]);
    const v = Number(values[i - 1]);
    for (let c = 0; c <= capacity; c++) {
      if (w <= c) {
        dp[i][c] = Math.max(dp[i - 1][c], dp[i - 1][c - w] + v);
      } else {
        dp[i][c] = dp[i - 1][c];
      }
    }
  }

  return dp[n][capacity];
}

// ============================================================================
// JS 版：最长公共子序列 (LCS) — 动态规划
// ============================================================================

export function jsLCS(a: any, b: any): number {
  const s1 = String(a);
  const s2 = String(b);
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}

// ============================================================================
// TS 版：0/1 背包问题 — 严格类型
// ============================================================================

export function tsKnapsack(weights: number[], values: number[], capacity: number): number {
  const n = weights.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1];
    const v = values[i - 1];
    for (let c = 0; c <= capacity; c++) {
      if (w <= c) {
        dp[i][c] = Math.max(dp[i - 1][c], dp[i - 1][c - w] + v);
      } else {
        dp[i][c] = dp[i - 1][c];
      }
    }
  }

  return dp[n][capacity];
}

// ============================================================================
// TS 版：最长公共子序列 (LCS) — 严格类型
// ============================================================================

export function tsLCS(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}
