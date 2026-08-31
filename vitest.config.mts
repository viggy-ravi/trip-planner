import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    // This Next.js version's package.json has no "exports" map, so Vite's
    // strict ESM resolution can't auto-resolve the extensionless "next/server"
    // specifier that next-auth imports internally (Next's own bundler is more
    // lenient about this). Point it at the real file directly.
    alias: {
      "next/server": "next/server.js",
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    // All test files share one Postgres test database and truncate it
    // between tests (see tests/helpers/db.ts) — running files in parallel
    // lets one file's reset wipe data another file is mid-test with.
    fileParallelism: false,
    server: {
      deps: {
        // Forces Vite to transform next-auth instead of deferring to Node's
        // native ESM resolver, which is what actually needs the alias above.
        inline: ["next-auth"],
      },
    },
  },
});
