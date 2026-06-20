// vite.config.js

// Vite
import { defineConfig } from "vite";

// React
import react from "@vitejs/plugin-react";

// Tailwind
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
