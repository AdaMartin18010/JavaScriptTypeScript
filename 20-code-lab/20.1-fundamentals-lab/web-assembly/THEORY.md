# WebAssembly — 理论基础

## 1. Wasm 设计目标

WebAssembly 是一种为 Web 设计的二进制指令格式：
- **高效快速**: 接近原生性能，体积小、解码快
- **安全**: 沙箱执行，内存隔离
- **开放**: 不依赖特定硬件或平台
- **语言无关**: C/C++、Rust、Go、AssemblyScript 等均可编译

## 2. 核心概念

- **模块（Module）**: Wasm 的基本部署单元，包含函数、内存、表、全局变量
- **线性内存**: 连续的、可调整大小的字节数组（ArrayBuffer）
- **栈机模型**: 基于操作数栈的指令执行（非寄存器机）
- **导入/导出**: 与宿主环境（JS）交互的接口

## 3. JS 互操作

```javascript
const wasmModule = await WebAssembly.instantiateStreaming(fetch('app.wasm'), imports)
const { add } = wasmModule.instance.exports
console.log(add(1, 2)) // 调用 Wasm 函数
```

- **共享内存**: JS 的 ArrayBuffer 与 Wasm 线性内存共享
- **TypedArray**: 直接读写 Wasm 内存中的数据

## 4. WASI（WebAssembly System Interface）

Wasm 的标准化系统接口，使 Wasm 模块能在浏览器外运行：
- **文件系统**: 打开、读取、写入文件
- **时钟**: 获取时间
- **随机数**: 获取加密安全随机数
- **运行时**: Wasmtime、Wasmer、Node.js 实验性支持

## 5. 应用场景

- **计算密集型任务**: 图像处理、音视频编解码、密码学
- **游戏引擎**: Unity、Unreal 的 Web 导出
- **遗留代码迁移**: C/C++ 代码库编译到 Web
- **插件系统**: 安全的第三方代码执行环境

## 6. 与相邻模块的关系

- **82-edge-ai**: Wasm 在边缘 AI 推理中的应用
- **79-compiler-design**: 编译到 Wasm 的编译器设计
- **34-blockchain-web3**: 区块链智能合约的 Wasm 运行时
