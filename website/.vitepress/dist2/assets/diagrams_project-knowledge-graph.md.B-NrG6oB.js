import{_ as t,o as a,c as s,j as n,a as e}from"./chunks/framework.DGDNmojq.js";const p=JSON.parse('{"title":"JavaScript/TypeScript 全景知识库 - 项目知识图谱","description":"","frontmatter":{"title":"JavaScript/TypeScript 全景知识库 - 项目知识图谱"},"headers":[],"relativePath":"diagrams/project-knowledge-graph.md","filePath":"diagrams/project-knowledge-graph.md","lastUpdated":1776456138000}'),S={name:"diagrams/project-knowledge-graph.md"};function o(c,r,C,i,R,d){return a(),s("div",null,[...r[0]||(r[0]=[n("p",null,[e("graph TB subgraph Meta [元认知层] GLOSSARY[GLOSSARY.md"),n("br"),e("术语标准] INDEX[COMPLETE_DOCUMENTATION_INDEX.md"),n("br"),e("完整索引] end")],-1),n("pre",null,[n("code",null,`subgraph Theory [理论层 - JSTS全景综述]
    LANG[01_language_core<br/>语言核心]
    CONCURRENCY[04_concurrency<br/>并发模型]
    DIST[05_distributed_systems<br/>分布式系统]
    ARCH[07_architecture<br/>架构设计]
    AI_ML[10_ai_ml<br/>AI/ML]
    ACADEMIC[ACADEMIC_ALIGNMENT_2025<br/>学术前沿]
end

subgraph Practice [实践层 - jsts-code-lab]
    CORE[00-language-core]
    ECMA[01-ecmascript-evolution]
    PATTERNS[02-design-patterns]
    CONCUR[03-concurrency]
    DS[04-data-structures]
    ALGO[05-algorithms]
    ARCHP[06-architecture-patterns]
    TEST[07-testing]
    FE[18-frontend-frameworks]
    BE[19-backend-development]
    MICRO[25-microservices]
    BROWSER[50-browser-runtime]
    DIST_SYS[70-distributed-systems]
    CONSENSUS[71-consensus-algorithms]
    FORMAL[80-formal-verification]
end

subgraph Tools [工具层 - awesome-jsts-ecosystem]
    ECOSYS[awesome-jsts-ecosystem<br/>生态导航]
end

subgraph Paths [路径层 - docs]
    BEGIN[beginners-path.md]
    INTER[intermediate-path.md]
    ADV[advanced-path.md]
    DT[decision-trees.md<br/>决策树]
    CM[comparison-matrices<br/>对比矩阵]
end

%% Cross-layer relationships
LANG --> CORE
LANG --> ECMA
CONCURRENCY --> CONCUR
CONCURRENCY --> BROWSER
DIST --> DIST_SYS
DIST --> CONSENSUS
ARCH --> ARCHP
ARCH --> MICRO
ACADEMIC --> FORMAL

%% Intra-practice dependencies
CORE --> PATTERNS
CORE --> CONCUR
CORE --> DS
PATTERNS --> ARCHP
ARCHP --> MICRO
MICRO --> DIST_SYS
DS --> ALGO
CONCUR --> BROWSER
CONCUR --> DIST_SYS
DIST_SYS --> CONSENSUS

%% Tool mappings
ECOSYS --> FE
ECOSYS --> BE
ECOSYS --> MICRO

%% Learning paths
BEGIN --> CORE
BEGIN --> PATTERNS
INTER --> ARCHP
INTER --> CONCUR
ADV --> DIST_SYS
ADV --> CONSENSUS
ADV --> FORMAL

%% Meta connections
GLOSSARY -.-> Theory
GLOSSARY -.-> Practice
GLOSSARY -.-> Tools
INDEX -.-> Theory
INDEX -.-> Practice
INDEX -.-> Paths
`)],-1)])])}const N=t(S,[["render",o]]);export{p as __pageData,N as default};
