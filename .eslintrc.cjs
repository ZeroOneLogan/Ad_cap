module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname
  },
  plugins: ['@typescript-eslint'],
  extends: ['next/core-web-vitals', 'prettier'],
  settings: {
    next: {
      rootDir: ['apps/web']
    }
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': 'warn'
  }
};
