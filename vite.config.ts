import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "path";
import { readFileSync } from "fs";

const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));

// The build is one self-contained index.html (scripts, styles and data inlined),
// so it opens straight from disk with a double-click, like Open Job Analysis.
export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(packageJson.version),
  },
});
