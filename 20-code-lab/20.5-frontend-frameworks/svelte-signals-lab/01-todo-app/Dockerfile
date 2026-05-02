# 多阶段构建：Svelte 5 TODO 应用

# ==================== 构建阶段 ====================
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖配置文件
COPY package.json ./

# 安装依赖
RUN npm install

# 复制源码
COPY . .

# 生产构建
RUN npm run build

# ==================== 运行阶段 ====================
FROM node:20-alpine AS runner

WORKDIR /app

# 仅复制构建产物和必要文件
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./

# 安装仅生产依赖（适配器可能需要）
RUN npm install --omit=dev

# 暴露端口
EXPOSE 3000

# 环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 启动应用（使用 SvelteKit 预览或 node 适配器）
CMD ["node", "build"]
