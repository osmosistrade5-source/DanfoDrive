/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare var process: {
  env: {
    GEMINI_API_KEY?: string;
    [key: string]: string | undefined;
  }
};
