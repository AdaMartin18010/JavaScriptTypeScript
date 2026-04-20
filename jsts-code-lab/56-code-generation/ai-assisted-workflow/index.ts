/**
 * AI 辅助编码工作流统一导出
 *
 * 本模块汇集 Cursor、Claude Code、GitHub Copilot 等 AI 工具的使用模式，
 * 以及 AI 生成测试、Prompt 工程的最佳实践。
 */

// Cursor IDE 最佳实践
export {
  cursorRulesTemplate,
  performAICodeReview,
  ComposerWorkflowMode,
  createComposerPrompt,
  composerExampleTask,
  cursorTestPrompts,
  generateCursorContext,
  quickFixPrompt,
  type AICodeReviewChecklist,
  type ComposerTask,
} from './cursor-workflow';

// Claude Code 使用模式
export {
  buildNLToCodePrompt,
  nlToCodeExample,
  RefactoringStrategy,
  buildRefactoringPrompt,
  refactoringExample,
  standardReviewDimensions,
  buildCodeReviewPrompt,
  BatchModificationType,
  buildBatchModificationPrompt,
  batchMigrationExample,
  ClaudeSessionManager,
  type NaturalLanguageToCodePrompt,
  type RefactoringTask,
  type ReviewDimension,
  type BatchModificationTask,
} from './claude-code-patterns';

// GitHub Copilot 高效使用
export {
  InlineCompletionTrigger,
  InlineCompletionBuilder,
  inlineCompletionExample,
  contextWindowTips,
  CopilotChatMode,
  CopilotChatPromptBuilder,
  explainCodeExample,
  buildWorkspaceTask,
  workspaceExample,
  copilotPromptPatterns,
  comprehensivePromptExample,
  copilotEfficiencyConfig,
  estimateSuggestionQuality,
  type CopilotWorkspaceTask,
} from './github-copilot-patterns';

// AI 生成测试策略
export {
  generateUnitTestPrompt,
  unitTestExample,
  generateE2ETestPrompt,
  e2eTestExample,
  aiTestingLimitations,
  evaluateGeneratedTests,
  TestGenerationWorkflow,
  standardCollaborativeWorkflow,
  generateCollaborativePrompt,
  testPromptTemplates,
  type TestFrameworkConfig,
  type UnitTestPromptParams,
  type UserStory,
  type E2ETestConfig,
  type TestReviewChecklist,
  type CollaborativeWorkflowConfig,
} from './ai-testing-generation';
