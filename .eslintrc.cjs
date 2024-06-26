module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  // 타입스크립트와 리액트를 사용할 때, 자주 사용되는 플러그인들 추가
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
    'plugin:@tanstack/eslint-plugin-query/recommended',
  ],
  ignorePatterns: [
    'dist',
    '.eslintrc.cjs',
    'vite.config.ts',
    'vitest.config.ts',
    '.lintstagedrc.cjs',
    'commitlint.config.cjs',
  ], // 설정파일들이나 배포된 파일은 린트룰 적용 x
  // 타입스크립트를 사용할 때, parser를 명시적으로 지정해줘야함.
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: '2020',
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  // 플러그인 추가 (타입스크립트 관련, 핫리로딩 관련 플러그인)
  plugins: ['@typescript-eslint', 'react-refresh', '@tanstack/query'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@tanstack/query/exhaustive-deps': 'error',
    '@tanstack/query/no-rest-destructuring': 'warn',
    '@tanstack/query/stable-query-client': 'error',
  },
  // eslint-plugin-react를 사용할 때는, react 버전을 명시적으로 지정해줘야함.
  settings: {
    react: {
      version: '18.0',
    },
  },
};
