import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Stale PWA bundle guard: clear old service workers on version change
const APP_VERSION = '__APP_VERSION_' + Date.now() + '__';
const STORED_VERSION_KEY = 'forge-app-version';

async function clearStaleCaches() {
  try {
    const storedVersion = localStorage.getItem(STORED_VERSION_KEY);
    if (storedVersion && storedVersion !== APP_VERSION) {
      // Version changed — clear caches and unregister SW
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      // Clear runtime caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }
      localStorage.setItem(STORED_VERSION_KEY, APP_VERSION);
      window.location.reload();
      return;
    }
    localStorage.setItem(STORED_VERSION_KEY, APP_VERSION);
  } catch {
    // Silently continue if storage/SW APIs fail
  }
}

clearStaleCaches();

createRoot(document.getElementById("root")!).render(<App />);
