import eslintJs from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist', 'docs'] },
  eslintJs.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
];
