export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
  APP_ENV?: string;
  HASH_SALT?: string;
}
