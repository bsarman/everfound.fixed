import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  preview: {
    buckets: {
      everfound: { access: "private" },
    },
    functions: {
      api: { name: "api", source: "./hello.ts" },
    },
  },
});
