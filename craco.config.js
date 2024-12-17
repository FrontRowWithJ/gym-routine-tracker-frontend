/* craco.config.js */
const path = require(`path`);

const ReactCompilerConfig = { compilationMode: "annotation", target: "18" };

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
  },
  babel: {
    plugins: [
      ["babel-plugin-react-compiler", ReactCompilerConfig], // must run first!
    ],
  },
  eslint: {
    enable: true,
    plugins: ["eslint-plugin-react-compiler"],
    rules: {
      "react-compiler/react-compiler": "error",
    },
  },
};
