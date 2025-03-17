export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "/api/v1";

export const WS_URL = 
  process.env.NEXT_PUBLIC_WS_URL || 
  (typeof window !== 'undefined' 
    ? `ws://${window.location.host}/ws` 
    : "ws://localhost:8080");
