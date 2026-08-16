const LOCAL_API = "http://localhost:4000";
const PRODUCTION_API = "https://api.ramanstore.com";

export function getApiBase() {
  const configured = String(import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
  const localBrowser = typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  if (localBrowser) return configured || LOCAL_API;
  if (configured && !/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(configured)) return configured;
  return PRODUCTION_API;
}

export const API_BASE = getApiBase();
