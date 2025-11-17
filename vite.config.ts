import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Corrected: Explicitly return null from the placeholder to satisfy TypeScript.
// A real plugin would return a Plugin object, like `eslint({ /* ... */ })`.
const someDevOnlyPlugin = () => {
  console.log("someDevOnlyPlugin placeholder is active in development mode");
  return null; // Return null instead of implicitly returning void
};


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080, // Your custom port is fine

    // --- ADD THIS PROXY SECTION ---
    // This makes your /api routes work during 'npm run dev'
    proxy: {
      '/api': {
        // This must match the port 'vercel dev' is running on
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
    // ---------------------------------
  },
  plugins: [
    react(),
    mode === 'development' ? someDevOnlyPlugin() : null,
  ].filter(Boolean), // This safely removes any `null` or `false` values
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));