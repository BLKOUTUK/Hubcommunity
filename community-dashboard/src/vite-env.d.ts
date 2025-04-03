/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_AIRTABLE_API_KEY: string;
  readonly VITE_AIRTABLE_BASE_ID: string;
  readonly VITE_HEARTBEAT_API_KEY: string;
  readonly VITE_HEARTBEAT_API_URL: string;
  readonly VITE_HEARTBEAT_WEBHOOK_SECRET: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_NOTIFICATIONS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}