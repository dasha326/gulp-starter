import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      'dev-server/**',
      'dist/**',
      'node_modules/**',
    ],
  },
  {
    ...js.configs.recommended,
    files: ['gulpfile.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ...js.configs.recommended,
    files: ['source/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        Swiper: 'readonly',
      },
    },
  },
];
