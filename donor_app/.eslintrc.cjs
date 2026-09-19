module.exports = {
  env: {
    browser: true,
    es2022: true,
    jest: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'react-native', 'react-hooks', 'prettier'],
  settings: {
    react: {
      version: '18.2',
    },
    'react-native': 'react-native',
  },
  rules: {
    'prettier/prettier': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'error',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: ['build/', 'node_modules/', 'dist/', '*.config.js'],
  overrides: [
    {
      files: ['**/*.test.js', '**/*.test.jsx', '**/*.spec.js', '**/*.spec.jsx', '**/*.test.ts', '**/*.test.tsx'],
      env: { jest: true },
    },
  ],
};