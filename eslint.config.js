const html = require("@html-eslint/eslint-plugin");

module.exports = [
  {
    ...html.configs["flat/recommended"],
    files: ["**/*.html"],
    rules: {
      ...html.configs["flat/recommended"].rules, // Must be defined. If not, all recommended rules will be lost
      "@html-eslint/no-multiple-h1": 0,
    },
  },
];
