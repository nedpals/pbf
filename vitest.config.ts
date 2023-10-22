import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        dir: "./tests",
        environment: "node",
        alias: {
            '@/': new URL('./src/', import.meta.url).pathname,
        }
    }
});
