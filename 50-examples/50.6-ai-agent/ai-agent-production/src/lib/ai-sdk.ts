/**
 * @file Vercel AI SDK 配置
 * @description 统一配置 AI 模型提供商、流式输出与工具调用适配器
 */

import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import type { LanguageModel } from "ai";

/**
 * 支持的模型提供商枚举
 */
export type ModelProvider = "openai" | "anthropic" | "deepseek";

/**
 * 从环境变量读取默认提供商
 */
function getDefaultProvider(): ModelProvider {
  const env = process.env.DEFAULT_MODEL_PROVIDER;
  if (env === "anthropic" || env === "deepseek") return env;
  return "openai";
}

/**
 * 从环境变量读取默认模型名称
 */
function getDefaultModel(): string {
  return process.env.DEFAULT_MODEL ?? "gpt-4o";
}

/**
 * 创建 OpenAI 提供商实例
 */
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 创建 Anthropic 提供商实例
 */
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * 创建 DeepSeek 提供商实例
 */
const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
});

/**
 * 提供商映射表
 */
const providers: Record<ModelProvider, typeof openai> = {
  openai,
  anthropic,
  deepseek,
};

/**
 * 获取指定提供商的模型实例
 * @param provider - 模型提供商
 * @param modelId - 模型 ID（如 gpt-4o, claude-3-5-sonnet-latest）
 * @returns LanguageModel 实例
 */
export function getModel(
  provider: ModelProvider = getDefaultProvider(),
  modelId: string = getDefaultModel()
): LanguageModel {
  const p = providers[provider];
  if (!p) {
    throw new Error(`不支持的模型提供商: ${provider}`);
  }
  return p(modelId);
}

/**
 * 获取默认模型实例（简化调用）
 */
export function getDefaultModelInstance(): LanguageModel {
  return getModel();
}

/**
 * AI SDK 全局配置
 */
export const aiConfig = {
  /** 默认最大 Token 数 */
  maxTokens: 4096,
  /** 默认温度参数 */
  temperature: 0.7,
  /** 默认 Top-P */
  topP: 1,
  /** 流式输出缓冲大小 */
  streamBufferSize: 64,
} as const;
