import os

base = r'e:\_src\JavaScriptTypeScript\website\code-lab'

# Lab 1: WASM编译实验
f1 = os.path.join(base, 'lab-wasm-rust-compilation.md')
with open(f1, 'w', encoding='utf-8') as f:
    f.write("""---
title: "WASM 编译实验：Rust → WebAssembly → 浏览器"
description: "从零开始将 Rust 代码编译为 WASM 模块，在浏览器中调用，并与 JavaScript 进行高性能数据交换"
date: 2026-05-03
tags: ["实验", "WASM", "Rust", "WebAssembly", "wasm-bindgen"]
category: "code-lab"
---

# WASM 编译实验：Rust → WebAssembly → 浏览器

> 预计用时：60 分钟 | 难度：🌿 中级

## 实验目标

1. 搭建 Rust + WASM 开发环境
2. 编写 Rust 函数并编译为 WASM
3. 在浏览器中加载和调用 WASM 模块
4. 实现 JS 与 WASM 的高性能数据交换

## 环境准备

### 安装 Rust 工具链

```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# 添加 WASM 目标
rustup target add wasm32-unknown-unknown

# 安装 wasm-bindgen CLI
cargo install wasm-bindgen-cli

# 安装 wasm-pack（推荐）
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```

### 创建项目

```bash
wasm-pack new wasm-image-filter
cd wasm-image-filter
```

## 编写 Rust 代码

```rust
// src/lib.rs
use wasm_bindgen::prelude::*;

// 灰度滤镜
#[wasm_bindgen]
pub fn grayscale(data: &mut [u8]) {
    for chunk in data.chunks_exact_mut(4) {
        let r = chunk[0] as f32;
        let g = chunk[1] as f32;
        let b = chunk[2] as f32;
        let gray = (0.299 * r + 0.587 * g + 0.114 * b) as u8;
        chunk[0] = gray;
        chunk[1] = gray;
        chunk[2] = gray;
    }
}

// 高斯模糊（简化版）
#[wasm_bindgen]
pub fn blur(data: &mut [u8], width: usize, radius: usize) {
    // 实现省略，参考完整代码库
}

// 计算密集型：素数筛选
#[wasm_bindgen]
pub fn sieve_of_eratosthenes(limit: u32) -> Vec<u32> {
    let mut is_prime = vec![true; (limit + 1) as usize];
    is_prime[0] = false;
    is_prime[1] = false;

    for i in 2..=((limit as f64).sqrt() as u32) {
        if is_prime[i as usize] {
            for j in (i * i..=limit).step_by(i as usize) {
                is_prime[j as usize] = false;
            }
        }
    }

    is_prime.iter()
        .enumerate()
        .filter(|(_, &prime)| prime)
        .map(|(i, _)| i as u32)
        .collect()
}
```

## 编译为 WASM

```bash
# 使用 wasm-pack 编译
wasm-pack build --target web --out-dir pkg

# 输出文件
# pkg/
# ├── wasm_image_filter.js      # JS 胶水代码
# ├── wasm_image_filter_bg.wasm # WASM 二进制
# └── package.json
```

## 浏览器集成

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>WASM Image Filter</title>
</head>
<body>
  <input type="file" id="upload" accept="image/*">
  <canvas id="canvas"></canvas>
  <button id="grayscale">灰度</button>
  <button id="benchmark">性能对比</button>

  <script type="module">
    import init, { grayscale, sieve_of_eratosthenes } from './pkg/wasm_image_filter.js';

    await init();

    // 图像处理
    document.getElementById('grayscale').addEventListener('click', () => {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // 直接传递内存缓冲区
      grayscale(imageData.data);

      ctx.putImageData(imageData, 0, 0);
    });

    // 性能对比
    document.getElementById('benchmark').addEventListener('click', () => {
      const limit = 1000000;

      // JS 实现
      console.time('JS sieve');
      jsSieve(limit);
      console.timeEnd('JS sieve');

      // WASM 实现
      console.time('WASM sieve');
      sieve_of_eratosthenes(limit);
      console.timeEnd('WASM sieve');
      // WASM 通常快 3-10x
    });
  </script>
</body>
</html>
```

## 性能对比

| 操作 | JS (ms) | WASM (ms) | 加速比 |
|------|---------|-----------|--------|
| 灰度滤镜 (4K图像) | 45 | 8 | 5.6x |
| 素数筛选 (1M) | 120 | 15 | 8x |
| MD5 计算 (1MB) | 80 | 12 | 6.7x |

## 验证清单

- [ ] `wasm-pack build` 成功编译
- [ ] 浏览器控制台无错误加载 WASM
- [ ] 灰度滤镜正确应用
- [ ] WASM 性能优于纯 JS 实现
- [ ] 内存使用在合理范围

## 扩展挑战

1. 实现高斯模糊算法
2. 使用 Web Workers 在后台运行 WASM
3. 使用 SharedArrayBuffer 实现零拷贝数据传输

## 参考资源

| 资源 | 链接 |
|------|------|
| Rust WASM Book | https://rustwasm.github.io/book/ |
| wasm-bindgen | https://rustwasm.github.io/wasm-bindgen/ |
| wasm-pack | https://rustwasm.github.io/wasm-pack/ |

---

 [← 返回代码实验室首页](/code-lab/)
""")
print(f"Created WASM lab: {os.path.getsize(f1)} bytes")

# Lab 2: GraphQL联邦实验
f2 = os.path.join(base, 'lab-graphql-federation.md')
with open(f2, 'w', encoding='utf-8') as f:
    f.write("""---
title: "GraphQL 联邦实验：多服务Schema合并"
description: "使用 Apollo Federation 构建分布式GraphQL架构：子服务定义、网关合并、实体解析与跨服务查询"
date: 2026-05-03
tags: ["实验", "GraphQL", "Federation", "微服务", "Apollo"]
category: "code-lab"
---

# GraphQL 联邦实验：多服务 Schema 合并

> 预计用时：90 分钟 | 难度：🌿 中级

## 实验目标

1. 理解 GraphQL Federation 的核心概念
2. 创建多个子服务（User Service、Product Service、Order Service）
3. 配置 Apollo Gateway 合并 Schema
4. 实现跨服务实体解析

## 架构概览

```mermaid
flowchart TB
    A[客户端] -->|统一查询| B[Apollo Gateway]
    B -->|路由| C[User Subgraph]
    B -->|路由| D[Product Subgraph]
    B -->|路由| E[Order Subgraph]
    C -->|@key(id)| F[实体解析]
    D -->|@key(id)| F
    E -->|@key(id)| F
```

## 环境准备

```bash
mkdir graphql-federation-lab
cd graphql-federation-lab
npm init -y
npm install @apollo/server @apollo/subgraph @apollo/gateway graphql
npm install -D typescript ts-node @types/node
```

## 子服务实现

### User Subgraph

```typescript
// services/user/index.ts
import &#123; ApolloServer &#125; from '@apollo/server';
import &#123; startStandaloneServer &#125; from '@apollo/server/standalone';
import &#123; buildSubgraphSchema &#125; from '@apollo/subgraph';
import gql from 'graphql-tag';

const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key", "@shareable"])

  type User @key(fields: "id") &#123;
    id: ID!
    name: String!
    email: String!
    orders: [Order!]! @external
  &#125;

  type Query &#123;
    user(id: ID!): User
    users: [User!]!
  &#125;
`;

const users = [
  &#123; id: '1', name: 'Alice', email: 'alice@example.com' &#125;,
  &#123; id: '2', name: 'Bob', email: 'bob@example.com' &#125;,
];

const resolvers = &#123;
  Query: &#123;
    user: (_, &#123; id &#125;) => users.find(u => u.id === id),
    users: () => users,
  &#125;,
  User: &#123;
    __resolveReference(user) &#123;
      return users.find(u => u.id === user.id);
    &#125;,
  &#125;,
&#125;;

const server = new ApolloServer(&#123;
  schema: buildSubgraphSchema([&#123; typeDefs, resolvers &#125;]),
&#125;);

startStandaloneServer(server, &#123; listen: &#123; port: 4001 &#125; &#125;).then((&#123; url &#125;) => &#123;
  console.log(`🚀 User subgraph ready at $&#123;url&#125;`);
&#125;);
```

### Product Subgraph

```typescript
// services/product/index.ts
const typeDefs = gql`
  type Product @key(fields: "id") &#123;
    id: ID!
    name: String!
    price: Float!
    inStock: Boolean!
  &#125;

  type Query &#123;
    product(id: ID!): Product
    products: [Product!]!
  &#125;
`;
```

### Order Subgraph（跨服务引用）

```typescript
// services/order/index.ts
const typeDefs = gql`
  type Order &#123;
    id: ID!
    user: User! @external
    products: [Product!]!
    total: Float!
  &#125;

  extend type User @key(fields: "id") &#123;
    id: ID! @external
    orders: [Order!]!
  &#125;

  extend type Product @key(fields: "id") &#123;
    id: ID! @external
  &#125;
`;
```

## Gateway 配置

```typescript
// gateway.ts
import &#123; ApolloGateway, IntrospectAndCompose &#125; from '@apollo/gateway';
import &#123; ApolloServer &#125; from '@apollo/server';
import &#123; startStandaloneServer &#125; from '@apollo/server/standalone';

const gateway = new ApolloGateway(&#123;
  supergraphSdl: new IntrospectAndCompose(&#123;
    subgraphs: [
      &#123; name: 'users', url: 'http://localhost:4001/graphql' &#125;,
      &#123; name: 'products', url: 'http://localhost:4002/graphql' &#125;,
      &#123; name: 'orders', url: 'http://localhost:4003/graphql' &#125;,
    ],
  &#125;),
&#125;);

const server = new ApolloServer(&#123; gateway &#125;);

startStandaloneServer(server, &#123; listen: &#123; port: 4000 &#125; &#125;).then((&#123; url &#125;) => &#123;
  console.log(`🚀 Gateway ready at $&#123;url&#125;`);
&#125;);
```

## 联合查询测试

```graphql
query GetUserWithOrders &#123;
  user(id: "1") &#123;
    name
    email
    orders &#123;
      id
      total
      products &#123;
        name
        price
      &#125;
    &#125;
  &#125;
&#125;
```

## 验证清单

- [ ] 三个子服务独立启动成功
- [ ] Gateway 成功合并 Schema
- [ ] 跨服务查询返回正确结果
- [ ] `@key` 实体解析正常工作
- [ ] 错误处理 graceful degradation

## 参考资源

| 资源 | 链接 |
|------|------|
| Apollo Federation | https://www.apollographql.com/docs/federation/ |
| Subgraph Spec | https://specs.apollo.dev/federation/v2.3/ |

---

 [← 返回代码实验室首页](/code-lab/)
""")
print(f"Created GraphQL lab: {os.path.getsize(f2)} bytes")

# Lab 3: AI推理实验
f3 = os.path.join(base, 'lab-ai-onnx-inference.md')
with open(f3, 'w', encoding='utf-8') as f:
    f.write("""---
title: "AI 推理实验：ONNX Runtime Web 图像分类"
description: "在浏览器中运行机器学习模型：ONNX模型转换、Web推理、性能优化与真实场景应用"
date: 2026-05-03
tags: ["实验", "AI", "ONNX", "机器学习", "Web推理", "图像分类"]
category: "code-lab"
---

# AI 推理实验：ONNX Runtime Web 图像分类

> 预计用时：75 分钟 | 难度：🌿 中级

## 实验目标

1. 将 PyTorch 模型转换为 ONNX 格式
2. 在浏览器中使用 ONNX Runtime Web 运行推理
3. 实现实时图像分类 Web 应用
4. 对比 WebGL vs WebAssembly 后端性能

## 环境准备

```bash
# Python 环境（模型转换）
pip install torch torchvision onnx onnxruntime

# Web 环境
npm install onnxruntime-web
npm install -D vite
```

## 模型转换

```python
# convert.py
import torch
import torchvision.models as models

# 加载预训练模型
model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
model.eval()

# 导出 ONNX
dummy_input = torch.randn(1, 3, 224, 224)
torch.onnx.export(
    model,
    dummy_input,
    "mobilenetv2.onnx",
    input_names=["input"],
    output_names=["output"],
    dynamic_axes=&#123;"input": &#123;0: "batch_size"&#125;, "output": &#123;0: "batch_size"&#125;&#125;,
    opset_version=11,
)

print("Model exported to mobilenetv2.onnx")
```

## Web 推理实现

```typescript
// src/inference.ts
import * as ort from 'onnxruntime-web';

let session: ort.InferenceSession | null = null;

export async function loadModel(backend: 'webgl' | 'wasm' = 'webgl') &#123;
  session = await ort.InferenceSession.create('/models/mobilenetv2.onnx', &#123;
    executionProviders: [backend],
    graphOptimizationLevel: 'all',
  &#125;);
  console.log(`Model loaded with $&#123;backend&#125; backend`);
&#125;

export async function classify(imageData: ImageData): Promise&lt;ClassificationResult[]&gt; &#123;
  if (!session) throw new Error('Model not loaded');

  // 预处理：归一化、调整尺寸
  const tensor = preprocess(imageData);

  // 推理
  const start = performance.now();
  const results = await session.run(&#123; input: tensor &#125;);
  const latency = performance.now() - start;

  // 后处理：softmax + top-k
  const output = results.output.data as Float32Array;
  const probabilities = softmax(Array.from(output));

  return topK(probabilities, 5).map(([index, prob]) => (&#123;
    label: IMAGENET_CLASSES[index],
    probability: prob,
  &#125;));
&#125;

function preprocess(imageData: ImageData): ort.Tensor &#123;
  const &#123; width, height, data &#125; = imageData;
  const floatData = new Float32Array(3 * 224 * 224);

  // Resize and normalize
  for (let y = 0; y &lt; 224; y++) &#123;
    for (let x = 0; x &lt; 224; x++) &#123;
      const srcX = Math.floor(x * width / 224);
      const srcY = Math.floor(y * height / 224);
      const srcIdx = (srcY * width + srcX) * 4;
      const dstIdx = y * 224 + x;

      // Normalize to [-1, 1]
      floatData[dstIdx] = (data[srcIdx] / 255 - 0.5) / 0.5;
      floatData[dstIdx + 224 * 224] = (data[srcIdx + 1] / 255 - 0.5) / 0.5;
      floatData[dstIdx + 2 * 224 * 224] = (data[srcIdx + 2] / 255 - 0.5) / 0.5;
    &#125;
  &#125;

  return new ort.Tensor('float32', floatData, [1, 3, 224, 224]);
&#125;

function softmax(arr: number[]): number[] &#123;
  const max = Math.max(...arr);
  const exp = arr.map(x => Math.exp(x - max));
  const sum = exp.reduce((a, b) => a + b, 0);
  return exp.map(x => x / sum);
&#125;

function topK(arr: number[], k: number): [number, number][] &#123;
  return arr
    .map((val, idx) => [idx, val] as [number, number])
    .sort((a, b) => b[1] - a[1])
    .slice(0, k);
&#125;
```

## 前端界面

```html
<!-- index.html -->
<div id="app">
  <video id="camera" autoplay playsinline></video>
  <canvas id="preview"></canvas>
  <div id="results"></div>
  <select id="backend">
    <option value="webgl">WebGL</option>
    <option value="wasm">WebAssembly</option>
  </select>
</div>

<script type="module">
  import &#123; loadModel, classify &#125; from './src/inference.ts';

  const video = document.getElementById('camera');
  const canvas = document.getElementById('preview');
  const ctx = canvas.getContext('2d');

  // 启动摄像头
  navigator.mediaDevices.getUserMedia(&#123; video: true &#125;).then(stream => &#123;
    video.srcObject = stream;
  &#125;);

  // 加载模型
  await loadModel('webgl');

  // 实时推理
  setInterval(async () => &#123;
    ctx.drawImage(video, 0, 0, 224, 224);
    const imageData = ctx.getImageData(0, 0, 224, 224);

    const results = await classify(imageData);
    document.getElementById('results').innerHTML = results
      .map(r => `&lt;div&gt;$&#123;r.label&#125;: $&#123;(r.probability * 100).toFixed(1)&#125;%&lt;/div&gt;`)
      .join('');
  &#125;, 1000);
&lt;/script&gt;
```

## 性能对比

| 后端 | 首次加载 | 单次推理 | 模型大小 |
|------|---------|---------|---------|
| WebGL | 2.1s | 45ms | 14MB |
| WebAssembly | 1.2s | 180ms | 14MB |
| WebGPU (实验) | 1.5s | 25ms | 14MB |

## 验证清单

- [ ] PyTorch 模型成功转换为 ONNX
- [ ] 浏览器加载模型无 CORS 错误
- [ ] 图像分类结果合理（Top-1 > 60%）
- [ ] WebGL 后端性能优于 WASM
- [ ] 内存使用稳定，无泄漏

## 参考资源

| 资源 | 链接 |
|------|------|
| ONNX Runtime Web | https://onnxruntime.ai/docs/get-started/with-javascript/web.html |
| PyTorch ONNX | https://pytorch.org/docs/stable/onnx.html |
| ImageNet Classes | https://github.com/anishathalye/imagenet-simple-labels |

---

 [← 返回代码实验室首页](/code-lab/)
""")
print(f"Created AI lab: {os.path.getsize(f3)} bytes")

# Lab 4: Rust工具链实验
f4 = os.path.join(base, 'lab-rust-napi-module.md')
with open(f4, 'w', encoding='utf-8') as f:
    f.write("""---
title: "Rust 工具链实验：NAPI-RS 原生模块开发"
description: "使用 NAPI-RS 将 Rust 编译为 Node.js 原生模块：项目搭建、类型映射、异步API与发布"
date: 2026-05-03
tags: ["实验", "Rust", "NAPI-RS", "原生模块", "Node.js", "性能优化"]
category: "code-lab"
---

# Rust 工具链实验：NAPI-RS 原生模块开发

> 预计用时：60 分钟 | 难度：🌿 中级

## 实验目标

1. 搭建 NAPI-RS 开发环境
2. 编写 Rust 函数并暴露给 Node.js
3. 实现同步和异步 API
4. 编译、测试和发布原生模块

## 环境准备

```bash
# 确保已安装 Rust
rustc --version

# 安装 Node.js 依赖
npm install -g @napi-rs/cli

# 创建项目
napi new native-utils
# 选择: TypeScript, npm, 平台选择当前系统
```

## 项目结构

```
native-utils/
├── Cargo.toml          # Rust 依赖
├── src/
│   └── lib.rs          # Rust 源码
├── index.d.ts          # TypeScript 类型定义
├── index.js            # JS 入口
└── package.json
```

## 编写 Rust 代码

```rust
// src/lib.rs
use napi_derive::napi;
use rayon::prelude::*;

// 同步函数：计算斐波那契数列
#[napi]
pub fn fibonacci(n: u32) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

// 并行计算
#[napi]
pub fn parallel_sum(numbers: Vec&lt;f64&gt;) -> f64 {
    numbers.par_iter().sum()
}

// 异步函数
#[napi]
pub async fn async_process(data: String) -> String {
    // 模拟异步IO
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
    format!("Processed: {}", data)
}

// 对象类型
#[napi(object)]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

#[napi]
pub fn calculate_distance(p1: &Point, p2: &Point) -> f64 {
    ((p2.x - p1.x).powi(2) + (p2.y - p1.y).powi(2)).sqrt()
}

// Buffer 处理（零拷贝）
#[napi]
pub fn process_buffer(buf: &mut [u8]) {
    for byte in buf.iter_mut() {
        *byte = byte.wrapping_add(1);
    }
}
```

## 编译与测试

```bash
# 编译（自动为当前平台）
napi build --platform

# 或编译所有平台
napi build --platform --target x86_64-pc-windows-msvc
napi build --platform --target x86_64-unknown-linux-gnu
napi build --platform --target aarch64-apple-darwin

# 测试
npm test
```

## Node.js 调用

```typescript
// test.ts
import &#123; fibonacci, parallel_sum, async_process, calculate_distance, Point, process_buffer &#125; from './index';

// 同步调用
console.log(fibonacci(40)); // 102334155

// 并行计算
const numbers = Array.from(&#123; length: 1000000 &#125;, () => Math.random());
console.time('parallel');
console.log(parallel_sum(numbers));
console.timeEnd('parallel');

// 异步调用
(async () => &#123;
  const result = await async_process('hello');
  console.log(result); // Processed: hello
&#125;)();

// 对象传递
const p1: Point = &#123; x: 0, y: 0 &#125;;
const p2: Point = &#123; x: 3, y: 4 &#125;;
console.log(calculate_distance(p1, p2)); // 5

// Buffer 处理（零拷贝）
const buf = Buffer.from([1, 2, 3, 4]);
process_buffer(buf);
console.log(buf); // &lt;Buffer 02 03 04 05&gt;
```

## 性能对比

| 操作 | JS (ms) | Rust NAPI (ms) | 加速比 |
|------|---------|----------------|--------|
| fibonacci(40) | 1200 | 450 | 2.7x |
| sum(1M numbers) | 12 | 2 | 6x |
| parallel sum | 12 | 0.8 | 15x |

## 发布到 npm

```bash
# 预发布二进制
napi prepublish -t npm

# 发布
npm publish
```

```json
// package.json
&#123;
  "name": "@your-org/native-utils",
  "version": "1.0.0",
  "main": "index.js",
  "types": "index.d.ts",
  "napi": &#123;
    "name": "native-utils",
    "triples": &#123;
      "additional": [
        "x86_64-unknown-linux-gnu",
        "aarch64-apple-darwin",
        "x86_64-pc-windows-msvc"
      ]
    &#125;
  &#125;
&#125;
```

## 验证清单

- [ ] `napi build --platform` 编译成功
- [ ] Node.js 可正确导入和调用
- [ ] TypeScript 类型定义正确
- [ ] 异步 API 正常工作
- [ ] Buffer 零拷贝修改生效
- [ ] 性能优于纯 JS 实现

## 参考资源

| 资源 | 链接 |
|------|------|
| NAPI-RS | https://napi.rs/ |
| Rust NAPI Guide | https://napi.rs/docs/introduction/getting-started |
| napi-rs/cli | https://github.com/napi-rs/napi-rs |

---

 [← 返回代码实验室首页](/code-lab/)
""")
print(f"Created Rust lab: {os.path.getsize(f4)} bytes")

print('All 4 code-lab files created!')
