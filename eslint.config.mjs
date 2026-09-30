import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "artifacts/**",
      ".lighthouseci/**",
      "test-results/**",
      "playwright-report/**",
    ],
  },
  {
    files: [
      ".storybook/**/*.mjs",
      "stories/**/*.mjs",
      "design-system/**/*.mjs",
      "tests/browser/**/*.mjs",
      "tests/review-worker.test.mjs",
      "preview/*.mjs",
      "scripts/{audit-images,capture-screenshots,optimize-images,run-screenshots,serve-static}.mjs",
      "scripts/{editorial-page,interior-pages,event-pages,sponsorship-pages,sponsor-system,capture-fullsite,optimize-media-previews}.mjs",
      "editorial.js",
      "playwright.config.mjs",
    ],
    ...js.configs.recommended,
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: { "no-unused-vars": ["error", { argsIgnorePattern: "^_" }] },
  },
];
