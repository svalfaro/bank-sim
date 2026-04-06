import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.node  // ← Node, not browser
    },
    rules: {
      // ── Unsafe patterns we actively forbid ────────────────────────────

      // eval() executes arbitrary strings as code — a direct XSS vector
      // if user input ever reaches eval(), attacker controls your server
      "no-eval": "error",

      // var is function-scoped and hoisted — causes subtle bugs
      // const and let are block-scoped and predictable
      "no-var": "error",

      // == does type coercion: '0' == false is TRUE in JavaScript
      // === checks type AND value: '0' === false is FALSE
      // type coercion bugs have caused real auth bypasses
      "eqeqeq": "error",

      // unused variables are dead code — often signals incomplete logic
      // or a forgotten import that could hide a security-relevant function
      "no-unused-vars": "warn",

      // async functions without await are almost always a mistake
      // leads to unhandled promises and silent failures
      "require-await": "error",

      // console.log left in production leaks internal state to logs
      // use a proper logger (morgan) instead
      "no-console": "warn",
    }
  }
]);