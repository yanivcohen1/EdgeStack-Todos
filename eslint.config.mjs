import nextConfig from "eslint-config-next";
import globals from 'globals'
import cypress from 'eslint-plugin-cypress'

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [
      "coverage/**",
      "playwright-report/**",
      "cypress/reports/**",
      "test-results/**",
      "public/**",
      "**/*.min.js",
      "**/*.map"
    ],
  },
  {
    files: ['cypress/**/*.cy.{js,ts}'],
    ...cypress.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.mocha,
        cy: 'readonly',
        Cypress: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
    },
  },
];

export default eslintConfig;
