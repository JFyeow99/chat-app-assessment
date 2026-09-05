// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  {
    settings: {
      'import/resolver': {
        typescript: { project: './jsconfig.json' },
      },
    },
    rules: {
      'react-hooks/refs': 'off',
      'react-hooks/immutability': 'off',
    },
  },
  prettierConfig,
  { ignores: ['dist/*', 'android/*', 'ios/*'] },
]);
