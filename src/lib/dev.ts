// Local-only escape hatch (project-overview §10.2). The NODE_ENV check means a
// stray `DEV_UNLOCK_ALL=true` in a production environment does nothing.
export const DEV_UNLOCK_ALL =
  process.env.DEV_UNLOCK_ALL === "true" && process.env.NODE_ENV !== "production";
