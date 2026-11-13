// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Windows မှာ path resolution ပြဿနာ မဖြစ်အောင် သတ်မှတ်ခြင်း
config.resolver.sourceExts.push("cjs");
config.watchFolders = [__dirname];

// ⭐ Windows မှာ Symlink (readlink) ပြဿနာ မဖြစ်အောင် ပိတ်မယ်
config.resolver.unstable_enableSymlinks = false;

module.exports = config;