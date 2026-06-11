import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Bot/agent size rule — no file over 200 lines
      // Files that exceed this are doing too many things and must be split
      "max-lines": ["warn", { max: 200, skipBlankLines: true, skipComments: true }],
    },
  },
]);

export default eslintConfig;
