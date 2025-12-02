import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // TypeScript type-aware linting
  ...tseslint.configs.recommendedTypeChecked,

  // Global ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "**/*.js",
    "**/*.mjs",
    "**/*.cjs",
  ]),

  // Custom rule overrides
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Disabled rules
      "@typescript-eslint/no-empty-interface": "off", // Delineate request from response even if same object
      "@typescript-eslint/no-namespace": "off", // Adding math-field element to JSX
      "@typescript-eslint/no-var-requires": "off", // Mocking node modules
      "react/react-in-jsx-scope": "off", // Next.js does this for us
      "react-hooks/exhaustive-deps": "off", // A lot of false positives

      // TODO: want to fix these and delete these lines below so they error
      "react/jsx-sort-props": "off", // Sort props alphabetically, turn back on
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/restrict-template-expressions": "warn",
      "@typescript-eslint/unbound-method": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
]);

export default eslintConfig;
