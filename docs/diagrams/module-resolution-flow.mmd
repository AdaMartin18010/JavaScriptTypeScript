---
title: ESM/CJS 模块解析与互操作流程
---

flowchart TD
    Start(["开始导入<br/>import / require"])
    
    subgraph Detection["模块类型检测"]
        CheckPkg["读取 package.json<br/>type 字段"]
        TypeModule["type: module<br/>→ ESM"]
        TypeCommon["type: commonjs<br/>→ CJS"]
        CheckExt["检查文件扩展名"]
        ExtMjs[".mjs → ESM"]
        ExtCjs[".cjs → CJS"]
        ExtJs[".js → 按 type 字段"]
        ExtTs[".ts → 按 tsconfig"]
    end
    
    subgraph ESM_Path["ESM 解析路径"]
        ESM_Specifier["解析说明符<br/>(Specifier)"]
        ESM_Relative["相对路径<br/>./foo.js"]
        ESM_Absolute["绝对路径<br/>/path/to/foo.js"]
        ESM_Bare["裸导入<br/>foo / foo/bar"]
        ESM_URL["URL 路径<br/>file:// / https://"]
        
        ESM_NodeModules["node_modules 查找<br/>逐层向上"]
        ESM_Exports["解析 exports 字段<br/>条件导出"]
        ESM_Main["解析 main 字段"]
        ESM_Index["尝试 index.js"]
    end
    
    subgraph CJS_Path["CJS 解析路径"]
        CJS_Specifier["解析说明符"]
        CJS_Relative["相对路径<br/>./foo"]
        CJS_Absolute["绝对路径"]
        CJS_Bare["裸导入"]
        
        CJS_NodeModules["node_modules 查找"]
        CJS_Main["解析 main 字段"]
        CJS_Index["尝试 index.js"]
        CJS_ExtOrder["扩展名优先级:<br/>.js → .json → .node"]
    end
    
    subgraph Interop["ESM/CJS 互操作"]
        ESM_Import_CJS["ESM 导入 CJS"]
        CJS_Require_ESM["CJS 导入 ESM<br/>❌ 静态 require 不支持"]
        CJS_Import_ESM["CJS 使用 dynamic import()<br/>✅ 支持异步导入 ESM"]
        
        ESM_Namespace["import * as ns<br/>ns.default = module.exports"]
        ESM_Default["import foo<br/>foo = module.exports"]
        ESM_Named["import { foo }<br/>从 exports 解构"]
        
        CJS_InteropWrap["__esModule 标记检查"]
        CJS_DefaultExport["default 导出处理"]
    end
    
    subgraph Resolution["最终解析"]
        LoadFile["加载文件"]
        ParseModule["解析模块"]
        CreateModuleRecord["创建模块记录<br/>Module Record"]
        LinkModules["链接模块<br/>解析导入/导出"]
        ExecuteModule["执行模块"]
        CacheModule["缓存模块<br/>Module Map"]
    end
    
    Start --> CheckPkg
    CheckPkg -->|"存在"| TypeModule
    CheckPkg -->|"存在"| TypeCommon
    CheckPkg -->|"不存在"| CheckExt
    
    TypeModule --> ESM_Specifier
    TypeCommon --> CJS_Specifier
    
    CheckExt --> ExtMjs
    CheckExt --> ExtCjs
    CheckExt --> ExtJs
    CheckExt --> ExtTs
    ExtMjs --> ESM_Specifier
    ExtCjs --> CJS_Specifier
    ExtJs --> CheckPkg
    ExtTs --> ESM_Specifier
    
    %% ESM 路径
    ESM_Specifier --> ESM_Relative
    ESM_Specifier --> ESM_Absolute
    ESM_Specifier --> ESM_Bare
    ESM_Specifier --> ESM_URL
    
    ESM_Bare --> ESM_NodeModules
    ESM_NodeModules --> ESM_Exports
    ESM_Exports -->|"无 exports"| ESM_Main
    ESM_Main -->|"无 main"| ESM_Index
    
    ESM_Relative -->|"无扩展名"| CheckExt
    ESM_Absolute -->|"无扩展名"| CheckExt
    ESM_Index --> LoadFile
    
    %% CJS 路径
    CJS_Specifier --> CJS_Relative
    CJS_Specifier --> CJS_Absolute
    CJS_Specifier --> CJS_Bare
    
    CJS_Bare --> CJS_NodeModules
    CJS_NodeModules --> CJS_Main
    CJS_Main -->|"无 main"| CJS_Index
    CJS_Index --> CJS_ExtOrder
    CJS_ExtOrder --> LoadFile
    
    CJS_Relative --> CJS_ExtOrder
    
    %% 互操作分支
    LoadFile -->|"文件是 CJS<br/>从 ESM 导入"| ESM_Import_CJS
    LoadFile -->|"文件是 ESM<br/>从 CJS 导入"| CJS_Require_ESM
    
    ESM_Import_CJS --> ESM_Namespace
    ESM_Import_CJS --> ESM_Default
    ESM_Import_CJS --> ESM_Named
    
    CJS_Require_ESM -->|"报错"| CJS_Import_ESM
    CJS_Import_ESM -->|"返回 Promise"| ParseModule
    
    ESM_Namespace --> CJS_InteropWrap
    ESM_Default --> CJS_InteropWrap
    ESM_Named --> CJS_InteropWrap
    CJS_InteropWrap --> CJS_DefaultExport
    
    %% 最终流程
    CJS_DefaultExport --> ParseModule
    LoadFile -.->|"直接加载"| ParseModule
    
    ParseModule --> CreateModuleRecord
    CreateModuleRecord --> LinkModules
    LinkModules --> ExecuteModule
    ExecuteModule --> CacheModule
    CacheModule --> End(["返回导出"])
    
    %% 样式
    style Detection fill:#e3f2fd
    style ESM_Path fill:#e8f5e9
    style CJS_Path fill:#fff3e0
    style Interop fill:#fce4ec
    style Resolution fill:#f3e5f5
    style Start fill:#bbdefb
    style End fill:#c8e6c9
