const js = require('@eslint/js');

module.exports = [
  {
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      'no-console': 'off',
      semi: ['error', 'always']
    }
  }
];
