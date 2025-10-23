module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
    webextensions: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'plugin:import/recommended'],
  plugins: ['import'],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    // Chrome extension files are loaded in order via HTML/manifest - don't enforce import ordering
    'import/order': 'off',
  },
};

// Declare globals exposed by separate non-module scripts
module.exports.globals = {
  initI18n: 'readonly',
  applyTranslations: 'readonly',
};
