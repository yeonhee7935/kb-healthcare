/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Vite 환경변수는 항상 문자열이라 'true'와 비교해서 써야 함 */
  readonly VITE_USE_MOCK: 'true' | 'false';
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
