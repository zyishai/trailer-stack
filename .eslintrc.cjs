/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    "@remix-run/eslint-config", 
    "@remix-run/eslint-config/node",
    "plugin:jsx-a11y/recommended",
    "plugin:prettier/recommended"
  ],
  ignorePatterns: [
    '/node_modules',
    '/build',
    '/public/build',
    '/public/fonts',
    'package*.json',
    'components.json'
  ]
};
