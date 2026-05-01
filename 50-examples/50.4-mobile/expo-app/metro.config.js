const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable Hermes (default in Expo SDK 52)
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Optimize bundle size
config.transformer.minifierConfig = {
  compress: {
    drop_console: true,
  },
};

// Support for Reanimated worklets
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = config;
