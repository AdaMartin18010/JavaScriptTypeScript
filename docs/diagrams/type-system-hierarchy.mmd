---
title: TypeScript 类型系统层次结构
---

flowchart TB
    subgraph Top["Top Type (最宽泛)"]
        unknown["unknown<br/>安全的顶层类型"]
        any["any<br/>禁用类型检查"]
    end
    
    subgraph ObjectTypes["Object Types (对象类型)"]
        object["object"]
        Function["Function"]
        Array["Array&lt;T&gt; / T[]"]
        Tuple["[T1, T2, ...] 元组"]
        Class["Class / Interface"]
    end
    
    subgraph PrimitiveTypes["Primitive Types (原始类型)"]
        string["string"]
        number["number"]
        boolean["boolean"]
        symbol["symbol"]
        bigint["bigint"]
        undefined["undefined"]
        null["null"]
        literal["字面量类型<br/>'hello' | 42 | true"]
    end
    
    subgraph ComplexTypes["Complex Types (复杂类型)"]
        Union["Union &amp; Intersection<br/>A | B / A &amp; B"]
        Generic["Generic&lt;T&gt;<br/>泛型"]
        Mapped["Mapped Types<br/>{ [K in T]: V }"]
        Conditional["Conditional Types<br/>T extends U ? X : Y"]
    end
    
    subgraph Bottom["Bottom Type (最具体)"]
        never["never<br/>空联合 / 不可达"]
    end
    
    %% 层级关系
    unknown --> object
    unknown --> string
    any -.->|"禁用检查"| object
    any -.->|"禁用检查"| string
    
    object --> Class
    object --> Function
    object --> Array
    
    string --> literal
    number --> literal
    boolean --> literal
    
    Class --> never
    Function --> never
    Array --> never
    literal --> never
    undefined --> never
    null --> never
    
    %% 复杂类型关系
    Union -->|"包含"| string
    Union -->|"包含"| number
    Intersection -->|"组合"| object
    Intersection -->|"组合"| Class
    
    Generic -.->|"实例化"| Array
    Generic -.->|"实例化"| Class
    
    Conditional -.->|"产生"| Union
    Conditional -.->|"产生"| never
    
    Mapped -.->|"转换"| object
    
    %% 特殊关系
    null & undefined -->|"非严格模式"| any
    
    style Top fill:#ffcccc
    style Bottom fill:#ccffcc
    style ObjectTypes fill:#ffffcc
    style PrimitiveTypes fill:#ccffff
    style ComplexTypes fill:#ffccff
