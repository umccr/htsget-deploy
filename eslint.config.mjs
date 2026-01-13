import esLint from "@eslint/js";
import tsEsLint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(
  esLint.configs.recommended,
  tsEsLint.configs.strictTypeChecked,
  tsEsLint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      ecmaVersion: 2020,
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.js", "*.mjs"],
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
