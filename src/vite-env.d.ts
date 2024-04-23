/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly readonly VITE_APP_TITLE: string
    readonly readonly VITE_PRODUCTION_API_KEY: string
    readonly readonly VITE_PRODUCTION_AUTH_DOMAIN: string
    readonly readonly VITE_PRODUCTION_URL: string
    readonly VITE_PRODUCTION_ID: string
    readonly VITE_PRODUCTION_BUCKET: string
    readonly VITE_PRODUCTION_MESSAGING: string
    readonly VITE_PRODUCTION_APP_ID: string
    readonly VITE_PRODUCTION_MEASUREMENT_ID: string
    readonly VITE_DEVELOPMENT_API_KEY: string
    readonly VITE_DEVELOPMENT_AUTH_DOMAIN: string
    readonly VITE_DEVELOPMENT_URL: string
    readonly VITE_DEVELOPMENT_ID: string
    readonly VITE_DEVELOPMENT_BUCKET: string
    readonly VITE_DEVELOPMENT_MESSAGING: string
    readonly VITE_DEVELOPMENT_APP_ID: string
    readonly VITE_DEVELOPMENT_MEASUREMENT_ID: string
}
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }