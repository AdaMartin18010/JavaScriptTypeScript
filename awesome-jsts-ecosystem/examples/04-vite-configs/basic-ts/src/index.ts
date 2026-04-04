/**
 * Vite + TypeScript 基础项目入口
 */

// 类型定义
interface AppConfig {
  name: string;
  version: string;
  debug: boolean;
}

// 配置
const config: AppConfig = {
  name: 'Vite Basic TS App',
  version: '1.0.0',
  debug: import.meta.env.DEV,
};

// 工具函数
const formatMessage = (msg: string): string => {
  return `[${new Date().toISOString()}] ${msg}`;
};

// 主函数
const init = (): void => {
  console.log(formatMessage('App initialized'));
  console.log('Config:', config);
  
  // 环境变量示例
  console.log('Mode:', import.meta.env.MODE);
  console.log('Base URL:', import.meta.env.BASE_URL);
  console.log('Dev:', import.meta.env.DEV);
  console.log('Prod:', import.meta.env.PROD);
};

// HMR 支持
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    console.log('HMR update:', newModule);
  });
}

// 初始化
init();

export { config, formatMessage };
export type { AppConfig };
