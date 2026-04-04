# Awesome JS/TS Ecosystem 文档站点

基于 VitePress 构建的文档站点。

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run docs:dev

# 构建
npm run docs:build

# 预览构建结果
npm run docs:preview
```

## 目录结构

```
website/
├── .vitepress/           # VitePress 配置
│   ├── config.ts         # 站点配置
│   ├── theme/            # 主题定制
│   └── sidebar.ts        # 侧边栏配置
├── public/               # 静态资源
├── guide/                # 指南页面
├── categories/           # 分类文档
├── index.md              # 首页
└── about.md              # 关于页面
```

## 贡献指南

请查看 [贡献指南](./guide/contributing.md) 了解如何参与文档编写。
