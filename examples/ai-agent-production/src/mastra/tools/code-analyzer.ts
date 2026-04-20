/**
 * @file 代码分析工具
 * @description 提供静态代码分析、复杂度计算与风格检查能力
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * 简单代码复杂度指标
 */
interface ComplexityMetrics {
  linesOfCode: number;
  cyclomaticComplexity: number;
  functionCount: number;
  maxNestingDepth: number;
  commentRatio: number;
}

/**
 * 计算代码复杂度（简化版）
 */
function analyzeComplexity(code: string): ComplexityMetrics {
  const lines = code.split("\n");
  const loc = lines.filter((l) => l.trim().length > 0 && !l.trim().startsWith("//")).length;

  // 统计分支语句数量（简化版圈复杂度）
  const branchKeywords = /\b(if|else|for|while|switch|case|catch|\?\:|\|\||\&\&)\b/g;
  const branchMatches = code.match(branchKeywords) ?? [];
  const cyclomatic = Math.max(1, branchMatches.length);

  // 统计函数数量
  const functionMatches = code.match(/\b(function|=>|\basync\s+function)\b/g) ?? [];
  const functionCount = Math.max(1, functionMatches.length);

  // 估算最大嵌套深度
  let maxDepth = 0;
  let currentDepth = 0;
  for (const line of lines) {
    const open = (line.match(/{/g) ?? []).length;
    const close = (line.match(/}/g) ?? []).length;
    currentDepth += open - close;
    maxDepth = Math.max(maxDepth, currentDepth);
  }

  // 注释比例
  const commentLines = lines.filter((l) =>
    l.trim().startsWith("//") || l.trim().startsWith("/*") || l.trim().startsWith("*")
  ).length;
  const commentRatio = loc > 0 ? commentLines / loc : 0;

  return {
    linesOfCode: loc,
    cyclomaticComplexity: cyclomatic,
    functionCount,
    maxNestingDepth: maxDepth,
    commentRatio: Number(commentRatio.toFixed(2)),
  };
}

/**
 * 代码质量评分（0-100）
 */
function calculateScore(metrics: ComplexityMetrics): number {
  let score = 100;

  // 圈复杂度惩罚
  if (metrics.cyclomaticComplexity > 10) {
    score -= (metrics.cyclomaticComplexity - 10) * 2;
  }

  // 嵌套深度惩罚
  if (metrics.maxNestingDepth > 3) {
    score -= (metrics.maxNestingDepth - 3) * 5;
  }

  // 函数长度惩罚
  const avgLoc = metrics.linesOfCode / metrics.functionCount;
  if (avgLoc > 50) {
    score -= (avgLoc - 50) * 0.5;
  }

  // 注释比例奖励
  if (metrics.commentRatio < 0.1) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 代码分析工具
 */
export const codeAnalyzeTool = createTool({
  id: "analyze-code",
  description: "分析代码质量：计算复杂度、圈复杂度、注释率等指标",
  inputSchema: z.object({
    code: z.string().describe("要分析的源代码文本"),
    language: z.string().default("typescript").describe("编程语言"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    metrics: z.object({
      linesOfCode: z.number(),
      cyclomaticComplexity: z.number(),
      functionCount: z.number(),
      maxNestingDepth: z.number(),
      commentRatio: z.number(),
    }),
    score: z.number(),
    suggestions: z.array(z.string()),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const metrics = analyzeComplexity(context.code);
      const score = calculateScore(metrics);

      const suggestions: string[] = [];
      if (metrics.cyclomaticComplexity > 10) {
        suggestions.push(`圈复杂度 ${metrics.cyclomaticComplexity} 偏高，建议拆分函数或简化条件逻辑`);
      }
      if (metrics.maxNestingDepth > 3) {
        suggestions.push(`最大嵌套深度 ${metrics.maxNestingDepth}，建议提取内部逻辑为独立函数`);
      }
      if (metrics.commentRatio < 0.1) {
        suggestions.push("注释比例不足 10%，建议为公共 API 和复杂逻辑添加注释");
      }
      if (score >= 80) {
        suggestions.push("代码质量良好，继续保持！");
      }

      return {
        success: true,
        metrics,
        score,
        suggestions,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        metrics: { linesOfCode: 0, cyclomaticComplexity: 0, functionCount: 0, maxNestingDepth: 0, commentRatio: 0 },
        score: 0,
        suggestions: [],
        error: message,
      };
    }
  },
});

/**
 * 代码审查工具
 */
export const codeReviewTool = createTool({
  id: "review-code",
  description: "对代码进行审查，输出潜在问题列表与改进建议",
  inputSchema: z.object({
    code: z.string().describe("要审查的源代码文本"),
    language: z.string().default("typescript").describe("编程语言"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    issues: z.array(
      z.object({
        severity: z.enum(["error", "warning", "info"]),
        line: z.number().optional(),
        message: z.string(),
        rule: z.string(),
      })
    ),
    summary: z.string(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const issues: Array<{
      severity: "error" | "warning" | "info";
      line?: number;
      message: string;
      rule: string;
    }> = [];

    const lines = context.code.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // 检测 console.log
      if (/\bconsole\.log\(/.test(line)) {
        issues.push({
          severity: "warning",
          line: lineNum,
          message: "生产代码中不应包含 console.log，建议使用结构化日志库",
          rule: "no-console-log",
        });
      }

      // 检测 any 类型
      if (/\:\s*any\b/.test(line)) {
        issues.push({
          severity: "warning",
          line: lineNum,
          message: "避免使用 any 类型，建议使用具体类型或 unknown",
          rule: "no-explicit-any",
        });
      }

      // 检测 TODO/FIXME
      if (/\/\/\s*(TODO|FIXME)/i.test(line)) {
        issues.push({
          severity: "info",
          line: lineNum,
          message: `发现未完成任务标记: ${line.trim()}`,
          rule: "todo-marker",
        });
      }

      // 检测潜在的空值问题
      if (/\!\./.test(line)) {
        issues.push({
          severity: "warning",
          line: lineNum,
          message: "使用非空断言操作符 (!.) 可能导致运行时错误，建议进行空值检查",
          rule: "no-non-null-assertion",
        });
      }
    }

    const errorCount = issues.filter((i) => i.severity === "error").length;
    const warningCount = issues.filter((i) => i.severity === "warning").length;
    const infoCount = issues.filter((i) => i.severity === "info").length;

    return {
      success: true,
      issues,
      summary: `审查完成: ${errorCount} 个错误, ${warningCount} 个警告, ${infoCount} 个提示`,
    };
  },
});
