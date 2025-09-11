module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'eslint-config-prettier'
  ],
  settings: { react: { version: 'detect' } },
  env: { browser: true, es2020: true, node: true, jest: false }
};
