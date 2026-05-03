---
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
| ONNX Runtime Web | <https://onnxruntime.ai/docs/get-started/with-javascript/web.html> |
| PyTorch ONNX | <https://pytorch.org/docs/stable/onnx.html> |
| ImageNet Classes | <https://github.com/anishathalye/imagenet-simple-labels> |

---

 [← 返回代码实验室首页](/code-lab/)
