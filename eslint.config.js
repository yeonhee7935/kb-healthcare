import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  { ignores: ['dist', 'src/types/api.generated.ts', 'public/mockServiceWorker.js'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // `const { unwanted, ...rest } = props`로 값을 걸러낼 때 unused 경고 방지
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      // React Compiler 전용 규칙 — 이 프로젝트는 Compiler를 안 써서 불필요한 경고임
      'react-hooks/incompatible-library': 'off',
    },
  },
  {
    // lastVirtualItem은 매 렌더 새로 생성되는 객체라 .index만 deps에 둠
    // (객체 전체를 넣으면 매 렌더 effect가 재실행됨)
    files: ['src/pages/task/_hooks/useTaskListVirtualizer.ts'],
    rules: {
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  eslintConfigPrettier,
);
