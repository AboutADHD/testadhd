import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/**
 * ESLint flat config. Uses the native flat-config arrays shipped by
 * eslint-config-next 16 directly (FlatCompat + eslint-plugin-react have a
 * circular-reference crash under ESLint 9).
 */
const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
