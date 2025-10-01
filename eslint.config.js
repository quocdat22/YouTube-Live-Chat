const globals = require("globals");
const pluginJs = require("@eslint/js");
const pluginPrettier = require("eslint-plugin-prettier");
const configPrettier = require("eslint-config-prettier");

module.exports = [
  {
    ignores: ["dist/", "node_modules/"]
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        chrome: "readonly",
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...configPrettier.rules,
    },
  },
  {
    files: ["eslint.config.js", "webpack.config.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
