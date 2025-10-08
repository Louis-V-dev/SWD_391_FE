/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10b981',
          foreground: '#ffffff',
          light: '#34d399',
          dark: '#059669',
        },
        secondary: {
          DEFAULT: '#f3f4f6',
          foreground: '#374151',
        },
        accent: {
          DEFAULT: '#d1fae5',
          foreground: '#065f46',
        },
        muted: {
          DEFAULT: '#f9fafb',
          foreground: '#6b7280',
        },
        border: '#e5e7eb',
        input: '#f9fafb',
        ring: '#10b981',
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#171717',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#171717',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
} 