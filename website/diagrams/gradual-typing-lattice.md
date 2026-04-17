---
title: 渐进类型系统精度格 (Gradual Typing Lattice)
---

flowchart BT
    subgraph Consistency["类型一致性 (Consistent With) ~"]
        direction TB
    end
    
    %% 精度层次 - 从下到上精度降低
    subgraph Precise["精确类型 (最严格)"]
        P1["具体值类型<br/>'hello' | 42 | true"]
        P2["字面量联合<br/>'a' | 'b' | 'c'"]
        P3["基础类型<br/>string | number | boolean"]
    end
    
    subgraph Structured["结构化类型"]
        S1["精确对象类型<br/>{ name: 'John', age: 30 }"]
        S2["接口类型<br/>interface Person { name: string }"]
        S3["泛型实例<br/>Array&lt;'hello'&gt;"]
    end
    
    subgraph Generic["泛型层次"]
        G1["有界泛型<br/>T extends string"]
        G2["无界泛型<br/>T"]
    end
    
    subgraph Dynamic["动态类型 (最宽松)"]
        D1["联合类型<br/>string | number"]
        D2["交叉类型<br/>A &amp; B"]
        D3["unknown<br/>安全顶层类型"]
        D4["any<br/>禁用类型检查 ☠️"]
    end
    
    %% 精度序关系（向上精度降低）
    P1 --> P2
    P2 --> P3
    
    P1 --> S1
    S1 --> S2
    S2 --> S3
    
    P3 --> G1
    S2 --> G1
    S3 --> G2
    G1 --> G2
    
    G2 --> D1
    G2 --> D2
    D1 --> D3
    D2 --> D3
    D3 --> D4
    
    %% 一致性关系（虚线）
    P1 -.->|"~"| S1
    P2 -.->|"~"| G1
    S2 -.->|"~"| D1
    G2 -.->|"~"| D3
    
    %% 特殊标记
    D4 -.->|"隐式转换"| P3
    D4 -.->|"隐式转换"| S2
    
    %% 子类型关系
    subgraph Subtyping["子类型关系 <:"]
        direction LR
        ST1["'hello' <: string"]
        ST2["{x:1,y:2} <: {x:number}"]
        ST3["T extends U ⇒ T <: U"]
    end
    
    %% 注释
    Note1["↑ 向上 = 精度降低<br/>↓ 向下 = 精度提高"]
    Note2["any 与所有类型一致<br/>但会破坏类型安全"]
    
    D4 --> Note2
    D3 --> Note1
    
    style Precise fill:#c8e6c9
    style Structured fill:#bbdefb
    style Generic fill:#fff9c4
    style Dynamic fill:#ffcdd2
    style D4 fill:#ef9a9a
    style Note1 fill:#f5f5f5
    style Note2 fill:#ffccbc
