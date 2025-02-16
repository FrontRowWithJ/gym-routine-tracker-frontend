// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(".", "src/"),
    },
  },
  eslint: {
    enable: true,
  },
};
