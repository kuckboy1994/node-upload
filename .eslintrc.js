const path = require('path')

const srcPath = path.join(__dirname, 'src')

module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['airbnb-base', 'prettier'],
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  globals: {},
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    '@typescript-eslint/no-explicit-any': 2,
    'linebreak-style': 0,
    'max-classes-per-file': ['error', 2],
  },
  settings: {
    'import/resolver': {
      alias: [['@', srcPath]],
    },
  },
}
