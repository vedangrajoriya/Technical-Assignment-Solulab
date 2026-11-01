/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forge: {
          bg: '#0b0f17',
          surface: '#111827',
          card: '#161f30',
          cardLight: '#1c283e',
          border: '#1e293b',
          borderHover: '#334155',
          primary: '#2563eb',
          primaryHover: '#1d4ed8',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          emerald: '#10b981',
          rose: '#ef4444',
          purple: '#8b5cf6',
          muted: '#94a3b8',
          text: '#f8fafc',
          textMuted: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
