import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable no-unused-vars globally (adjust as needed)
      "@typescript-eslint/no-unused-vars": "off",

      // You can disable other rules here too
      // "some-other-rule": "off",
    },
  },
];

export default eslintConfig;
