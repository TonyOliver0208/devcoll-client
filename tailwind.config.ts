import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'stack': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI Adjusted"', '"Segoe UI"', '"Liberation Sans"', 'sans-serif'],
        'sans': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI Adjusted"', '"Segoe UI"', '"Liberation Sans"', 'sans-serif'],
      },
      colors: {
        'stack-orange': '#F48024',
        'stack-blue': '#0a95ff',
        'stack-blue-dark': '#0074cc',
      },
    },
  },
  plugins: [],
}

export default config
