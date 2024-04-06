const { getDefaultConfig } = require('expo/metro-config');

// Allow expo to reconize .db file and the user then in a require
const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.assetExts.push("db");
module.exports = defaultConfig
