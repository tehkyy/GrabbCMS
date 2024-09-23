/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly readonly VITE_APP_TITLE: string
    readonly readonly VITE_API_KEY: string
    readonly readonly VITE_AUTH_DOMAIN: string
    readonly readonly VITE_URL: string
    readonly VITE_ID: string
    readonly VITE_BUCKET: string
    readonly VITE_MESSAGING: string
    readonly VITE_APP_ID: string
    readonly VITE_MEASUREMENT_ID: string
    readonly VITE_DROPPER: string
    readonly VITE_FUNCTION_DROPP_KEY: string
    readonly VITE_LOGGER_ENDPOINT: string
}
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }