# ============================================================
# SvelteKit 博客平台 —— Dockerfile
# 多阶段构建，最终使用 Node.js 运行 SSR 应用
# ============================================================

# -------- 阶段 1：构建 --------
FROM node:22-alpine AS builder

WORKDIR /app

# 安装依赖（利用 Docker 缓存层）
COPY package.json ./
RUN npm install

# 复制源代码
COPY . .

# 构建 SvelteKit 应用
# 注意：adapter-auto 在构建时检测不到平台时会回退到 adapter-static
# 如需 SSR，请将 svelte.config.js 中的 adapter 改为 @sveltejs/adapter-node
RUN npm run build

# -------- 阶段 2：运行 --------
FROM node:22-alpine AS runner

WORKDIR /app

# 仅复制必要文件
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# 环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# SvelteKit adapter-node 构建产物入口
CMD ["node", "build"]

# ============================================================
# 使用说明：
#   docker build -t sveltekit-blog .
#   docker run -p 3000:3000 sveltekit-blog
#
# 若使用 adapter-auto（无 Node 适配器）：
#   1. 安装 adapter-node: npm i -D @sveltejs/adapter-node
#   2. 修改 svelte.config.js: import adapter from '@sveltejs/adapter-node'
#   3. 重新构建 Docker 镜像
# ============================================================
