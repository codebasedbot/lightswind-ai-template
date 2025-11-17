import type { Config } from "tailwindcss";

export default {
	darkMode: 'class',
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		extend: {
			fontFamily: {
				// Re-adding the 'inter' font family definition to resolve the error
				'inter': ['Inter', 'sans-serif']
			},
		}
	}, // The theme now extends the default configuration to include 'font-inter'
	plugins: [
		require("tailwindcss-animate"),
		require("lightswind/plugin"),

	],
} satisfies Config;