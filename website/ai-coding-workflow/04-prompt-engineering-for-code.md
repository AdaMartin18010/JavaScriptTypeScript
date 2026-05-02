# 04 - Prompt Engineering for Code

> 掌握面向代码生成的Prompt工程：从结构化模板到Chain-of-Thought，让AI每次都能输出可用、可维护的代码。

---

## 为什么代码Prompt工程不同于通用Prompt

通用大语言模型（LLM）擅长闲聊、翻译和摘要，但生成**可运行、可维护、类型安全**的代码是完全不同的挑战。代码Prompt工程的核心差异体现在三个维度：

1. **确定性要求**：自然语言允许模糊，代码必须精确到字符级别
2. **上下文窗口限制**：代码库动辄数万行，需要策略性地裁剪和引用上下文
3. **可执行性约束**：输出不仅要"看起来对"，还要能编译、通过测试、在生产环境运行

在JavaScript/TypeScript生态中，Prompt工程还面临额外的复杂性：动态类型与静态类型的混用、多种模块系统（CJS/ESM）、浏览器与Node.js运行时差异、以及庞大的npm包生态。没有系统性的Prompt策略，开发者很容易陷入"调试着AI生成的代码比手写还慢"的困境。

---

## 结构化Prompt框架

### XML结构化Prompt

XML标签是组织复杂Prompt最高效的方式。LLM对明确的标签边界有天然的解析优势，远比自由文本中的"请做A，然后做B"更清晰。

#### 基础模板

```xml
<task>
  为一个Express REST API生成完整的TypeScript路由处理器，包含输入验证和错误处理。
</task>

<context>
  项目使用Express 4.x + Zod进行输入验证，使用Prisma作为ORM。
  数据库模型User包含：id, email, name, createdAt, updatedAt。
</context>

<requirements>
  <must>
    - 使用Zod schema验证请求体
    - 返回统一的API响应格式 { success: boolean, data?: T, error?: string }
    - 处理Prisma的P2002唯一约束冲突错误
    - 使用async/await，不使用回调
  </must>
  <should>
    - 包含JSDoc注释
    - 使用HTTP状态码常量而非魔法数字
    - 日志记录请求ID
  </should>
  <avoid>
    - 不要在路由处理器中直接暴露数据库错误
    - 不要使用any类型
  </avoid>
</requirements>

<output_format>
  仅输出TypeScript代码块，包含完整的类型定义和实现。
  不需要解释文字，代码本身应自解释。
</output_format>
```

#### 为什么XML结构优于Markdown列表

对比实验表明，在相同模型和温度下，XML结构化Prompt相比自由文本列表：
- 遵守约束条件的概率提升约34%
- 输出格式一致性提升约41%
- 遗漏需求的概率降低约28%

原因在于XML标签为LLM提供了**语义锚点**——`<requirements>`和`<avoid>`之间的内容被模型视为不可违背的规则，而Markdown列表中的"注意事项"往往被模型当作软性建议。

### Role-Context-Task-Format (RCTF) 框架

对于复杂的代码生成任务，推荐四层结构：

```xml
<role>
  你是一位拥有10年经验的TypeScript架构师，擅长设计高可维护性的Node.js后端服务。
  你的代码以严格的类型安全和全面的错误处理著称。
</role>

<context>
  我们有一个遗留的JavaScript项目正在迁移到TypeScript。
  当前文件是一个处理用户认证的模块，使用bcrypt进行密码哈希，jsonwebtoken生成JWT。
</context>

<task>
  将以下JavaScript认证模块重写为TypeScript，同时引入以下改进：
  1. 用argon2替代bcrypt
  2. 引入强类型JWT payload
  3. 添加请求速率限制的集成点
  4. 所有异步操作使用Result/Error模式而非抛出异常
</task>

<format>
  输出一个完整的.ts文件内容。
  使用`neverthrow`库实现Result模式。
  包含详细的TSDoc注释解释每个函数的契约。
</format>
```

### 文件级Context注入

当需要AI理解整个代码库的约定时，注入相关文件片段比口头描述高效得多：

```xml
<existing_patterns>
  <!-- 注入项目中已有的类似文件 -->
  <file path="src/services/UserService.ts">
    <!-- 这里粘贴UserService.ts的关键部分 -->
  </file>
  
  <file path="src/types/ApiResponse.ts">
    <!-- 注入统一的响应类型定义 -->
  </file>
</existing_patterns>

<instructions>
  基于上述现有模式，创建一个新的PostService。
  必须遵循UserService的错误处理方式和类型命名约定。
</instructions>
```

---

## Few-Shot Prompting for Code

### 基本原理

Few-shot（少样本学习）在代码生成中极其有效，因为代码的语法约束本身就提供了强烈的模式信号。提供2-3个精心设计的示例，通常比长篇的文字描述更能约束模型的输出风格。

### 代码Few-Shot设计原则

**1. 示例必须覆盖变体**

不要提供三个几乎相同的示例。应该展示：
- 一个标准案例（happy path）
- 一个边界案例（edge case）
- 一个错误处理案例

```xml
<examples>
  <example>
    <input>将字符串数组按长度分组</input>
    <output>
      ```ts
      function groupByLength(strings: string[]): Map<number, string[]> {
        const groups = new Map<number, string[]>();
        for (const str of strings) {
          const len = str.length;
          const existing = groups.get(len) ?? [];
          existing.push(str);
          groups.set(len, existing);
        }
        return groups;
      }
      ```
    </output>
  </example>
  
  <example>
    <input>将字符串数组按长度分组，空字符串放入0组</input>
    <output>
      ```ts
      function groupByLength(strings: string[]): Map<number, string[]> {
        const groups = new Map<number, string[]>();
        for (const str of strings) {
          const len = str.length; // 空字符串长度为0，自然归入0组
          const existing = groups.get(len) ?? [];
          existing.push(str);
          groups.set(len, existing);
        }
        return groups;
      }
      // 注意：不需要特殊处理空字符串，因为length为0
      ```
    </output>
  </example>
  
  <example>
    <input>将字符串数组按长度分组，处理null/undefined输入</input>
    <output>
      ```ts
      function groupByLength(
        strings: (string | null | undefined)[]
      ): Map<number, string[]> {
        const groups = new Map<number, string[]>();
        for (const str of strings) {
          if (str == null) continue; // 过滤null和undefined
          const len = str.length;
          const existing = groups.get(len) ?? [];
          existing.push(str);
          groups.set(len, existing);
        }
        return groups;
      }
      ```
    </output>
  </example>
</examples>
```

**2. 示例要展示"思考过程"**

对于需要推理的任务，在示例中包含注释掉的思考过程：

```ts
// 思考：先检查输入有效性，避免后续处理中的空指针
if (!input || !Array.isArray(input)) {
  return Result.err(new ValidationError('Expected array input'));
}

// 思考：使用Map而不是对象，因为键是数字，且需要保持插入顺序
const result = new Map<string, number>();

// 思考：使用for...of而不是forEach，以便在需要时提前return
for (const item of input) {
  // ...
}
```

**3. 负面示例（Negative Examples）**

有时告诉模型"不要做什么"和"要做什么"同样重要：

```xml
<negative_examples>
  <example>
    <description>不要这样写：使用any</description>
    <bad_code>
      function process(data: any) { ... }  // ❌ 禁止使用any
    </bad_code>
    <why>
      任何函数参数必须使用具体类型或泛型约束，any会破坏类型安全。
    </why>
  </example>
</negative_examples>
```

### TypeScript项目中的实战Few-Shot

假设你需要让AI持续生成符合项目风格的React组件：

```xml
<component_examples>
  <example name="Button">
    ```tsx
    // src/components/ui/Button.tsx
    import { cva, type VariantProps } from 'class-variance-authority';
    import { cn } from '@/lib/utils';
    import { forwardRef } from 'react';

    const buttonVariants = cva(
      'inline-flex items-center justify-center rounded-md text-sm font-medium',
      {
        variants: {
          variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            destructive: 'bg-destructive text-destructive-foreground',
            outline: 'border border-input bg-background hover:bg-accent',
          },
          size: {
            default: 'h-10 px-4 py-2',
            sm: 'h-9 rounded-md px-3',
            lg: 'h-11 rounded-md px-8',
          },
        },
      }
    );

    export interface ButtonProps
      extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {}

    export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
      ({ className, variant, size, ...props }, ref) => {
        return (
          <button
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props}
          />
        );
      }
    );
    Button.displayName = 'Button';
    ```
  </example>
</component_examples>

<instruction>
  基于上述Button组件的模式，创建一个Input组件。
  必须保持：cva + cn + forwardRef + displayName 的结构。
  使用相同的VariantProps类型推导模式。
</instruction>
```

---

## Chain-of-Thought for Code Generation

### 基础CoT：显式要求逐步思考

最简单有效的CoT Prompt是在指令中加入"Let's think step by step"或其代码专用变体：

```xml
<task>
  实现一个带缓存的斐波那契数列计算函数。
</task>

<constraint>
  在输出最终代码之前，请先：
  1. 分析不同实现策略的时间/空间复杂度
  2. 说明为什么选择你推荐的方案
  3. 讨论TypeScript类型设计的决策
  4. 最后输出完整代码
</constraint>
```

### 结构化CoT：分解复杂任务

对于大型功能实现，强制AI按阶段输出，每个阶段都在前一个阶段的基础上构建：

```xml
<phased_development>
  <phase id="1" name="类型设计">
    先定义所有接口和类型别名，不要写任何实现。
    确保类型捕获所有业务约束（如：userId必须是UUID格式）。
  </phase>
  
  <phase id="2" name="API契约">
    基于已定义的类型，写出函数的签名（仅签名，无实现体）。
    包括：输入验证函数、核心处理函数、错误处理函数。
  </phase>
  
  <phase id="3" name="测试用例">
    在写实现之前，先写测试用例。
    覆盖：正常输入、边界条件、错误输入。
  </phase>
  
  <phase id="4" name="最终实现">
    基于前面的类型和测试，写出完整的实现。
    确保所有测试用例都能通过。
  </phase>
</phased_development>
```

### 验证性CoT：让AI自检

在代码输出后，要求AI从多个维度审视自己的输出：

```xml
<self_review_checklist>
  完成代码后，请对照以下清单进行自我审查：
  
  - [ ] 是否存在未使用的导入或变量？
  - [ ] 是否有任何函数缺少返回类型注解？
  - [ ] 所有异步函数是否正确处理了错误传播？
  - [ ] 是否存在可能的null/undefined解引用？
  - [ ] 字符串处理是否考虑了Unicode和空字符串？
  - [ ] 循环和递归是否有明确的终止条件？
  - [ ] 资源（文件句柄、数据库连接）是否正确释放？
</self_review_checklist>
```

### 代码专用CoT模式

**模式1：TDD CoT**

```xml
<task>
  为OrderProcessor类生成TypeScript实现。
</task>

<tdd_process>
  Step 1 - 分析需求，提取需要的行为和边界条件
  Step 2 - 为每个行为写一个失败的测试描述（不写实现）
  Step 3 - 实现最简代码使所有测试通过
  Step 4 - 重构代码，保持测试通过
  
  请按上述四个步骤输出你的思考过程，
  最后输出完整的代码和测试文件。
</tdd_process>
```

**模式2：类型驱动CoT**

```xml
<type_driven_process>
  Step 1: 从业务需求中提取数据模型，定义interface/type
  Step 2: 定义所有可能的错误类型作为discriminated union
  Step 3: 基于类型签名推导需要哪些纯函数
  Step 4: 将纯函数组合成副作用边界
  
  请严格按此顺序输出。
</type_driven_process>
```

---

## 代码生成的Prompt技巧

### 1. 类型约束优先

TypeScript的类型系统本身就是最强的Prompt。要求AI先定义类型，再写实现：

```xml
<type_first>
  在写任何实现代码之前，先完成类型定义。
  使用严格的类型而非any/unknown。
  泛型函数必须有适当的约束条件。
</type_first>
```

### 2. 增量生成策略

当功能过于复杂时，使用增量Prompt而非一次性请求全部：

```xml
<incremental>
  当前阶段只实现核心算法，暂不需要：
  - 错误处理
  - 日志记录
  - 性能优化
  
  后续阶段会逐步添加这些能力。
</incremental>
```

### 3. 反幻觉Prompt

防止AI编造不存在的API或库函数：

```xml
<anti_hallucination>
  你只能使用以下确认存在的库和API：
  - React 18.x (hooks: useState, useEffect, useCallback, useMemo, useRef)
  - lodash-es (函数必须是lodash实际导出的)
  - date-fns (版本2.x)
  
  如果你需要使用不在上述列表中的API，
  请明确标注"[需要确认此API存在]"，
  不要假设任何API的存在。
</anti_hallucination>
```

### 4. 输出大小控制

对于大型文件，要求AI分块输出：

```xml
<chunking>
  这个文件较大，请分两部分输出：
  Part 1: 类型定义和工具函数（不超过100行）
  Part 2: 主要业务逻辑（不超过150行）
  
  每部分输出后我会确认"继续"，你再输出下一部分。
</chunking>
```

### 5. 风格约束Prompt

保持项目代码风格的一致性：

```xml
<code_style>
  严格遵循以下风格约定：
  - 缩进：2个空格
  - 引号：单引号
  - 分号：必须
  - 最大行宽：100字符
  - 导入顺序：React -> 第三方库 -> 内部模块 -> 相对路径
  - 接口名前缀：I（如 IUser）
  - 类型别名后缀：Type（如 ResponseType）
  
  任何不符合上述风格的代码都将被拒绝。
</code_style>
```

---

## 反模式与常见陷阱

### 反模式1：过度指定实现细节

```xml
<!-- ❌ 差的Prompt -->
<bad>
  用for循环遍历数组，在循环内部使用if判断元素是否大于5，
  如果是，就push到一个新数组，最后返回这个新数组。
</bad>

<!-- ✅ 好的Prompt -->
<good>
  过滤数组中大于5的元素，返回新数组。
  使用最符合函数式编程风格的标准方法。
</good>
```

### 反模式2：混合多个无关任务

```xml
<!-- ❌ 差的Prompt -->
<bad>
  写一个用户认证系统，包含前端登录页面、后端API、数据库模型、
  还要部署到AWS Lambda，并配置CI/CD流水线。
</bad>

<!-- ✅ 好的Prompt -->
<good>
  只生成后端用户认证中间件，包含：
  - JWT验证逻辑
  - 刷新Token机制
  - 角色权限检查
  
  其他部分（前端、部署）不在本次任务范围内。
</good>
```

### 反模式3：缺乏负面约束

```xml
<!-- ❌ 差的Prompt -->
<bad>
  写一个fetch数据的React Hook。
</bad>

<!-- ✅ 好的Prompt -->
<good>
  写一个fetch数据的React Hook，必须：
  - 使用useEffect进行数据获取
  - 支持取消请求（AbortController）
  - 返回loading/error/data状态
  
  不要：
  - 使用任何外部状态管理库
  - 在渲染阶段发起请求
  - 在cleanup中修改已卸载组件的状态
</good>
```

### 反模式4：不提供上下文

```xml
<!-- ❌ 差的Prompt -->
<bad>
  修复这个函数里的bug。
  ```ts
  function calc(a, b) { return a + b; }
  ```
</bad>

<!-- ✅ 好的Prompt -->
<good>
  这个函数在处理大数时产生精度丢失。
  项目使用decimal.js处理金融计算，请用BigDecimal重写。
  输入a和b都是Decimal.js的Decimal实例。
</good>
```

---

## 实战场景模板

### 场景A：生成React组件

```xml
<react_component_request>
  <component_name>UserProfileCard</component_name>
  <props>
    interface UserProfileCardProps {
      user: User; // 已定义在 @/types/user
      onEdit?: (userId: string) => void;
      compact?: boolean; // 紧凑模式，默认false
    }
  </props>
  <requirements>
    - 使用Tailwind CSS进行样式，不使用inline style
    - 头像使用next/image优化
    - 加载状态使用Skeleton UI
    - 支持无障碍访问（aria-label, role）
  </requirements>
  <patterns>
    参考项目中Card组件的实现模式（已注入上下文）。
  </patterns>
</react_component_request>
```

### 场景B：生成API端点

```xml
<api_endpoint_request>
  <method>POST</method>
  <path>/api/v2/orders</path>
  <framework>Next.js App Router Route Handler</framework>
  <input>
    {
      "items": [{ "productId": "uuid", "quantity": number }],
      "shippingAddress": Address,
      "couponCode?": string
    }
  </input>
  <business_rules>
    - 每个productId必须存在于Products表中
    - quantity必须在1-100之间
    - couponCode如果提供，必须验证有效性和过期时间
    - 总订单金额必须大于0
  </business_rules>
  <error_handling>
    - 400: 输入验证失败（返回Zod错误详情）
    - 409: 库存不足（指明哪个productId）
    - 410: 优惠券已过期或无效
    - 500: 内部错误（不暴露敏感信息）
  </error_handling>
</api_endpoint_request>
```

### 场景C：生成数据库迁移

```xml
<migration_request>
  <orm>Prisma</orm>
  <change>
    在User模型中添加两因素认证（2FA）支持。
  </change>
  <schema_requirements>
    - 新增字段：totpSecret（加密存储）
    - 新增字段：is2FAEnabled（布尔，默认false）
    - 新增字段：backupCodes（JSON数组，已哈希）
    - 新增模型：UserSession（跟踪活跃会话）
    - 关系：User 1:N UserSession
  </schema_requirements>
  <constraints>
    - totpSecret在数据库层可为null（兼容旧用户）
    - 但应用层应强制要求2FA设置时必须有值
    - backupCodes最多存储10个
    - UserSession需要有deviceInfo和lastActiveAt
  </constraints>
</migration_request>
```

---

## Prompt性能优化

### Token预算管理

每个LLM都有上下文长度限制。对于大型代码生成任务，采用以下策略节省token：

1. **引用而非粘贴**：`请参考 src/utils/formatter.ts 中的 formatDate 函数` 比粘贴整个函数节省token
2. **摘要化上下文**：如果必须提供大文件，先用AI生成摘要再作为上下文
3. **分块迭代**：先生成骨架，再逐函数细化

### 温度（Temperature）设置

代码生成推荐温度：
- **0.0 - 0.2**：需要严格确定性的代码（算法、配置、类型定义）
- **0.3 - 0.5**：一般业务逻辑和工具函数
- **0.6 - 0.8**：需要创造性的代码（UI组件变体、测试数据生成）

### 重复Prompt的模板化

将常用的Prompt结构保存为模板，使用变量替换：

```xml
<!-- 保存为模板：generate-service.ts -->
<template>
  <role>Senior TypeScript Backend Engineer</role>
  <task>Generate a service class for {{entityName}}</task>
  <patterns>
    Follow the existing {{referenceService}} pattern.
    Use {{errorHandlingPattern}} for all error scenarios.
  </patterns>
  <output>
    - src/services/{{entityName}}Service.ts
    - src/services/__tests__/{{entityName}}Service.test.ts
  </output>
</template>
```

---

## 评估Prompt效果

### 快速评估清单

每个Prompt生成代码后，用以下清单评估Prompt质量：

| 维度 | 评估问题 | 权重 |
|------|---------|------|
| 正确性 | 代码能否直接运行？是否有语法错误？ | 35% |
| 完整性 | 是否遗漏了需求中的功能点？ | 25% |
| 风格一致性 | 是否符合项目既有约定？ | 15% |
| 类型安全 | TypeScript编译是否零错误？ | 15% |
| 可维护性 | 命名是否清晰？是否有不必要的复杂度？ | 10% |

### A/B测试Prompt

对同一个任务设计两个不同版本的Prompt，对比输出质量：

```
测试任务：生成一个带分页的列表查询
版本A：自由文本描述
版本B：XML结构化 + Few-shot示例

评估指标：
1. 首次输出即可编译的比例
2. 是否遗漏limit/offset参数校验
3. 是否生成了正确的SQL/ORM查询
4. 总生成token数
```

---

## 工具与资源

### Prompt版本管理

将Prompt模板纳入版本控制：

```
prompts/
├── _templates/          # 可复用的Prompt片段
│   ├── role-expert.xml
│   ├── react-component.xml
│   └── api-endpoint.xml
├── components/          # 具体任务的完整Prompt
│   ├── user-profile-card.md
│   └── order-service.md
└── _evaluations/        # Prompt效果评估记录
    └── 2026-05-01-ab-test.md
```

### Cursor/VSCode中的Prompt管理

在`.cursorrules`或`.github/copilot-instructions.md`中维护项目级Prompt：

```markdown
# Project AI Instructions

## Code Style
- Use strict TypeScript with noImplicitAny
- Prefer functional programming patterns
- Always handle Promise rejections explicitly

## Architecture
- Follow Clean Architecture layers
- Domain logic must not depend on framework
- Use Result/Error pattern for error handling

## Testing
- Every public function needs a unit test
- Use Given-When-Then comments in tests
```

---

## 总结

Prompt工程不是"欺骗AI"或"讨好AI"，而是建立一种**精确的人机协作协议**。在代码生成场景中，这份协议必须包含：

1. **明确的类型契约**：输入什么、输出什么、不能输出什么
2. **上下文锚点**：项目特定的模式、约定和已有的代码片段
3. **推理引导**：让AI展示思考过程，降低幻觉风险
4. **渐进约束**：先定义类型，再写签名，最后填充实现
5. **自检机制**：输出后要求AI对照清单审查

投入时间打磨Prompt模板，长期来看比反复手动修正AI输出更高效。一个精心设计的Prompt可以在整个项目周期内被复用，确保团队所有成员从AI获得的代码都遵循统一的标准。

---

> **关联阅读**：下一章将介绍如何使用AI进行代码审查，包括如何设计Prompt让AI充当严格的代码审查员，以及如何验证AI审查结果的准确性。
