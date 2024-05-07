import pluginJs from "@eslint/js";
import globals from "globals";

export default [
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.webextensions },
    },
  },
  pluginJs.configs.recommended,
];
