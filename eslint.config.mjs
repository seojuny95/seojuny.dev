import eslint from "@eslint/js";
import astro from "eslint-plugin-astro";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      ".astro/**",
      ".vercel/**",
      "dist/**",
      "node_modules/**",
      "public/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    files: ["src/**/*.{ts,tsx}"],
    ...reactHooks.configs.flat["recommended-latest"],
  },
];
