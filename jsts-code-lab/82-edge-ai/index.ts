/**
 * @file 边缘AI模块
 * @module Edge AI
 * @description
 * 边缘AI：
 * - 模型优化（量化、剪枝、蒸馏）
 * - 设备推理（ONNX 桥接、WebNN、WebGPU）
 * - 联邦学习
 * - TinyML 模型加载
 * - 推理优化（缓存、批处理）
 * - 设备能力检测
 */

export * as EdgeInference from './edge-inference.js';
export * as FederatedLearning from './federated-learning.js';
export * as ModelQuantization from './model-quantization.js';
export * as ONNXRuntimeBridge from './onnx-runtime-bridge.js';
export * as WebNNWrapper from './webnn-wrapper.js';
export * as WebGPUCompute from './webgpu-compute.js';
export * as TinyMLLoader from './tinyml-loader.js';
export * as InferenceOptimizer from './inference-optimizer.js';
export * as DeviceCapability from './device-capability.js';
