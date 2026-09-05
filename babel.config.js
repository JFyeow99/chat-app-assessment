module.exports = function (api) {
  api.cache(true);
  return {
    // react-compiler: on from the first build (opted in deliberately).
    presets: [['babel-preset-expo', { 'react-compiler': true }]],
    // Required by Reanimated 4 — must stay last.
    plugins: ['react-native-worklets/plugin'],
  };
};
