/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// JSON module declarations
declare module "*.json" {
  const value: unknown;
  export default value;
}

// Specific declarations for data files
declare module "@/data/occupations.json" {
  const value: {
    occupations: { [socCode: string]: unknown };
  };
  export default value;
}

declare module "@/data/onet/processed/titles-index.json" {
  const value: { [title: string]: Array<{ code: string; title: string; matchType: string }> };
  export default value;
}
