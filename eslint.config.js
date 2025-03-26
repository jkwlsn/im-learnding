const html = require("@html-eslint/eslint-plugin");

module.exports = [
    {
        ...html.configs["flat/recommended"],
        files: ["**/*.html"],
        rules: {
            ...html.configs["flat/recommended"].rules, // Must be defined. If not, all recommended rules will be lost
            "@html-eslint/no-multiple-h1": 0,
            "@html-eslint/indent": ["error", 4],
            "@html-eslint/no-script-style-type": "error",
            "@html-eslint/require-meta-charset": "error",
            "@html-eslint/attrs-newline": 0,
            "@html-eslint/lowercase": "error",
            "@html-eslint/no-multiple-empty-lines": "error",
            "@html-eslint/no-trailing-spaces": "error",
            "@html-eslint/sort-attrs": ["error", {
                "priority": ["type", "id", "class", "style"]
            }],
            "@html-eslint/no-extra-spacing-text": "error",
        },
    },
];
