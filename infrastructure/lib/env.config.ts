// Mirrors citius's per-stage config shape. Nothing app-specific to
// configure yet (no database, no secrets) — this exists so future stage-
// specific values (env vars, feature flags) have a home without having to
// re-thread `stage` through the stack again.
export type AppEnv = {
  stage: string;
};

export const getEnvConfig = (stage: string): AppEnv => ({ stage });
