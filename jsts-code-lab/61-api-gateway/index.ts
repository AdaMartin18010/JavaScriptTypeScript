/**
 * @file API网关模块
 * @module API Gateway
 * @description
 * API网关模式：
 * - 请求路由
 * - 认证授权
 * - 限流熔断
 * - 负载均衡
 * - 缓存层
 * - 请求转换
 * - 健康检查
 * - 响应聚合
 */

export * as GatewayImplementation from './gateway-implementation.js';
export * as RateLimiting from './rate-limiting.js';
export * as Authentication from './authentication.js';
export * as RequestRouting from './request-routing.js';
export * as LoadBalancing from './load-balancing.js';
export * as CachingLayer from './caching-layer.js';
export * as RequestTransformer from './request-transformer.js';
export * as HealthCheck from './health-check.js';
export * as ResponseAggregator from './response-aggregator.js';
