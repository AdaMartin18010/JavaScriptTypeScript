---
title: Event Loop 架构对比 - Browser vs Node.js vs Worker
---

flowchart TB
    subgraph Browser["🌐 Browser Event Loop"]
        B_Macro["Macrotask Queue<br/>(Task Queue)"]
        B_Micro["Microtask Queue<br/>(Promise, queueMicrotask)"]
        B_Render["Render Steps<br/>RAF, Style, Layout, Paint"]
        B_Exec["JavaScript Execution"]
        
        B_Exec -->|"执行完当前任务"| B_Micro
        B_Micro -->|"清空微任务"| B_Render
        B_Render -->|"每 16ms 或需要时"| B_Macro
        B_Macro -->|"取下一个宏任务"| B_Exec
    end
    
    subgraph Node["⚙️ Node.js Event Loop"]
        direction TB
        N_Phases["事件循环阶段<br/>libuv"]
        N_Timers["timers<br/>setTimeout/setInterval"]
        N_Pending["pending callbacks<br/>系统回调"]
        N_Idle["idle/prepare<br/>内部使用"]
        N_Poll["poll<br/>I/O 回调"]
        N_Check["check<br/>setImmediate"]
        N_Close["close callbacks<br/>close 事件"]
        N_Micro["NextTick Queue<br/>& Microtask Queue"]
        
        N_Phases --> N_Timers
        N_Timers --> N_Pending
        N_Pending --> N_Idle
        N_Idle --> N_Poll
        N_Poll --> N_Check
        N_Check --> N_Close
        N_Close --> N_Timers
        
        N_Timers -.->|"阶段间检查"| N_Micro
        N_Poll -.->|"阶段间检查"| N_Micro
        N_Check -.->|"阶段间检查"| N_Micro
        N_Micro -.->|"NextTick 优先"| N_Micro
    end
    
    subgraph Worker["🔧 Worker Event Loop"]
        W_Macro["Macrotask Queue"]
        W_Micro["Microtask Queue"]
        W_Message["Message Queue<br/>(postMessage)"]
        W_Exec["Worker Script Execution"]
        
        W_Exec -->|"执行"| W_Micro
        W_Micro -->|"清空"| W_Message
        W_Message -->|"处理消息"| W_Macro
        W_Macro -->|"下一个任务"| W_Exec
    end
    
    subgraph Legend["📋 时序图例"]
        direction LR
        L_Macro["⬛ Macrotask<br/>setTimeout, setInterval,<br/>setImmediate (Node),<br/>I/O, UI rendering"]
        L_Micro["🟦 Microtask<br/>Promise.then,<br/>queueMicrotask,<br/>MutationObserver"]
        L_NextTick["🟨 process.nextTick<br/>(Node.js only,<br/>优先级最高)"]
        L_Render["🟩 Render<br/>(Browser only)"]
    end
    
    %% 对比说明
    Browser -.->|"每轮循环包含渲染"| Legend
    Node -.->|"分阶段处理 I/O"| Legend
    Worker -.->|"无 DOM/渲染"| Legend
    
    style Browser fill:#e3f2fd
    style Node fill:#fff8e1
    style Worker fill:#f3e5f5
    style Legend fill:#f5f5f5
    style L_Micro fill:#bbdefb
    style L_NextTick fill:#fff59d
    style L_Render fill:#c8e6c9
