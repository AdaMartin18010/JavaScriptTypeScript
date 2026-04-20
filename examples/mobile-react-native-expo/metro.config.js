const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// 获取 Expo 默认的 Metro 配置
const config = getDefaultConfig(__dirname);

// 使用 withNativeWind 包装配置，启用 CSS 导入支持
module.exports = withNativeWind(config, { input: './global.css' });
