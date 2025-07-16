const node = require('eslint-plugin-node');
const importPlugin = require('eslint-plugin-import');
const promise = require('eslint-plugin-promise');

module.exports = [
  {
    files: ['src/**/*.js'],
    ignores: ['node_modules/**'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    plugins: {
      node,
      import: importPlugin,
      promise
    },
    rules: {
      'no-console': 'off',
      semi: ['error', 'always']
    }
  }
];
