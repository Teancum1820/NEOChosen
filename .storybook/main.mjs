export default {
  stories: ["../stories/**/*.stories.mjs"],
  framework: { name: "@storybook/html-vite", options: {} },
  staticDirs: [{ from: "../images", to: "/images" }],
  core: { disableTelemetry: true },
};
