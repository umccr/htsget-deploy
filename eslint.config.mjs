import esLint from "@eslint/js";
import tsEsLint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig(
  globalIgnores(["**/*.js", "**/*.d.ts", "**/cdk.out/"]),
  esLint.configs.recommended,
  tsEsLint.configs.strictTypeChecked,
  tsEsLint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },
  {
    files: ["**/*.mjs"],
    extends: [tsEsLint.configs.disableTypeChecked],
  },
);
