import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['var(--font-display)', 'monospace'],
      },
      colors: {
        terminal: {
          bg: '#0a0e0a',
          surface: '#0f1410',
          card: '#131a13',
          border: '#1e2e1e',
          green: '#00ff41',
          'green-dim': '#00cc33',
          'green-muted': '#004d14',
          'green-glow': '#00ff4120',
          amber: '#ffb300',
          red: '#ff3333',
          'text-primary': '#c8ffd0',
          'text-secondary': '#6b9e72',
          'text-muted': '#3d5e42',
        }
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'scan': 'scan 3s linear infinite',
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideUp': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'glitch': 'glitch 0.3s ease',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
        'typing': 'typing 1.5s steps(20) infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 5px #00ff4140' },
          '50%': { boxShadow: '0 0 20px #00ff4160, 0 0 40px #00ff4120' },
        }
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px)`,
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      backgroundSize: {
        'grid': '40px 40px',
      }
    },
  },
  plugins: [],
}
export default config
