---
title: JavaScript 执行模型与 ECMA-262 规范对应
---

flowchart LR
    subgraph Source["源代码阶段"]
        SourceCode["JavaScript/TypeScript<br/>源代码"]
    end
    
    subgraph Parsing["Parser 解析阶段<br/>ECMA-262 §12"]
        Tokenizer["词法分析 Lexer<br/>§12.1-12.4"]
        Parser["语法分析 Parser<br/>§12.5-12.16"]
        EarlyErrors["早期错误检查<br/>§16.1"]
    end
    
    subgraph AST["AST 生成阶段<br/>ECMA-262 §5.2"]
        AST_Node["抽象语法树<br/>Script / Module Record"]
        ScopeAnalysis["作用域分析<br/>§8.1 词法环境"]
    end
    
    subgraph Compilation["编译阶段<br/>ECMA-262 §14"]
        BytecodeGen["字节码生成<br/>§14.1-14.6"]
        Optimization["优化阶段<br/>JIT / Ignition"]
    end
    
    subgraph Execution["执行阶段<br/>ECMA-262 §9"]
        ExecutionContext["执行上下文栈<br/>§9.4"]
        Realm["Realm / 全局环境<br/>§8.3"]
        JobQueue["Job Queues<br/>§9.5"]
    end
    
    subgraph Runtime["运行时组件"]
        Heap["堆内存<br/>对象存储"]
        Stack["调用栈<br/>§9.4 Execution Contexts"]
        EventLoop["Event Loop<br/>§9.7 Agents"]
    end
    
    SourceCode --> Tokenizer
    Tokenizer -->|"Tokens"| Parser
    Parser -->|"语法树"| EarlyErrors
    EarlyErrors -->|"有效 AST"| AST_Node
    
    AST_Node -->|"遍历"| ScopeAnalysis
    ScopeAnalysis -->|"绑定标识符"| BytecodeGen
    
    BytecodeGen -->|"字节码"| Optimization
    Optimization -->|"优化代码"| ExecutionContext
    
    ExecutionContext -->|"入栈"| Stack
    ExecutionContext -->|"对象分配"| Heap
    ExecutionContext -->|"任务调度"| JobQueue
    
    JobQueue -->|"驱动"| EventLoop
    EventLoop -->|"回调执行"| ExecutionContext
    
    %% 反馈优化循环
    ExecutionContext -.->|"性能数据"| Optimization
    
    style Source fill:#e1f5fe
    style Parsing fill:#fff3e0
    style AST fill:#f3e5f5
    style Compilation fill:#e8f5e9
    style Execution fill:#ffebee
    style Runtime fill:#fce4ec
