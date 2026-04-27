const { colors } = require("./theme.json");

/** @type {import("expo/config").ExpoConfig} */
module.exports = {
  name: "sazio",
  slug: "sazio",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "sazio",
  userInterfaceStyle: "dark",
  splash: {
    backgroundColor: colors.surface.app,
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.anonymous.sazio",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: colors.surface.app,
    },
    package: "com.anonymous.sazio",
  },
  web: {
    bundler: "metro",
    output: "static",
  },
  plugins: [
    "expo-router",
    "@clerk/expo",
    "@react-native-community/datetimepicker",
    "expo-web-browser",
    "expo-image",
    "expo-secure-store",
  ],
  experiments: {
    reactCompiler: true,
    typedRoutes: true,
  },
};
