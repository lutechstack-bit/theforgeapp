import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "fonts/*.woff2", "images/**/*"],
      manifest: {
        name: "the Forge",
        short_name: "Forge",
        description: "Premium filmmaking cohort app",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,svg,woff2}"],
        globIgnores: ["**/images/mentors/**"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
        // Production hardening: ensure fresh content on updates
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // Cache images with CacheFirst (safe, no auth tokens)
            urlPattern: /\.(?:png|jpg|jpeg|webp|gif)$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "images-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            // Cache the /auth hero mp4 at runtime so return visits load
            // the 10 MB video from disk. We DON'T precache it (users
            // who never see /auth shouldn't pay the bandwidth) — this
            // is a lazy, first-request-populates-cache strategy.
            urlPattern: /\/login\/.*\.mp4$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "auth-video-cache",
              expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 * 30 },
              rangeRequests: true,
              cacheableResponse: { statuses: [0, 200, 206] },
            },
          },
          // Removed Supabase caching to prevent auth token issues
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
