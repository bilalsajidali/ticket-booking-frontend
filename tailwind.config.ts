import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)', // Custom CSS variables
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
} satisfies Config;
