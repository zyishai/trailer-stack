/** @type {import("prettier").Options} */
export default {
	arrowParens: 'avoid',
	bracketSameLine: false,
	bracketSpacing: true,
	embeddedLanguageFormatting: 'auto',
	endOfLine: 'lf',
	htmlWhitespaceSensitivity: 'css',
	insertPragma: false,
	jsxSingleQuote: false,
	printWidth: 80,
	proseWrap: 'always',
	quoteProps: 'as-needed',
	requirePragma: false,
	semi: true,
	singleAttributePerLine: false,
	singleQuote: false,
	tabWidth: 2,
	trailingComma: 'all',
	useTabs: false,
	overrides: [
		{
			files: ['**/*.json'],
			options: {
				useTabs: false,
			},
		},
	],

  tailwindFunctions: ['clsx', 'cva', 'cn'],
  plugins: ['prettier-plugin-tailwindcss']
};
