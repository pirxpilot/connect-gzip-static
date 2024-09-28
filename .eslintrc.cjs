// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  ignorePatterns: ["node_modules", "dist", "coverage"],
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    extraFileExtensions: [".json"],
    ecmaVersion: 12,
    sourceType: "module",
    tsconfigRootDir: __dirname, // eslint-disable-line no-undef
    project: "./tsconfig.json",
  },
  overrides: [
    {
      files: ["**/*.js", "**/*.ts"],
    },
  ],
  plugins: [
    "simple-import-sort",
    "import",
    "json-format",
    "prettier",
    "@typescript-eslint",
    "unused-imports",
  ],
  rules: {
    radix: 0,
    "no-new": 0,
    "no-void": 0,
    "no-shadow": 0,
    "no-bitwise": 0,
    "no-unused-vars": 0,
    "prettier/prettier": ["error"],
    "linebreak-style": ["error", "unix"],
    "no-prototype-builtins": 0,
    "prefer-rest-params": 0,
    "no-mixed-spaces-and-tabs": 0,
    "import/no-cycle": "error",
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/unbound-method": 0,
    "@typescript-eslint/no-unsafe-argument": 0,
    "@typescript-eslint/no-unsafe-return": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "@typescript-eslint/no-var-requires": 0,
    "eslint-comments/no-unlimited-disable": 0,
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-unsafe-call": 0,
    "simple-import-sort/imports": [
      "error",
      {
        groups: [["^node:", "^[a-z]", "^@?\\w", "^", "^\\.", "^\\u0000"]],
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        args: "all",
        varsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        argsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-shadow": 0,
    "@typescript-eslint/no-unnecessary-type-constraint": 0,
    "@typescript-eslint/no-unsafe-assignment": 0,
    "@typescript-eslint/restrict-plus-operands": 2,
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-unsafe-member-access": 0,
    "@typescript-eslint/require-await": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/no-floating-promises": [
      "error",
      { ignoreVoid: true, ignoreIIFE: true },
    ],
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".json"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
    },
  },
};
