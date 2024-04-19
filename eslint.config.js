const js = require("@eslint/js");
const jest = require("eslint-plugin-jest");
const globals = require("globals");

module.exports = [
	{
		languageOptions: {
			globals: globals.node
		}
	},
	js.configs.recommended,
	{
		files: ["test/**"],
		...jest.configs["flat/recommended"],
		rules: jest.configs["flat/recommended"].rules,
	},
	{
		rules: {
			indent: ["error", "tab"],
			"linebreak-style": ["error", "unix"],
			quotes: ["error", "double"],
			semi: "error"
		}
	}
];
