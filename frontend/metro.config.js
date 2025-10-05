const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable network debugging
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
