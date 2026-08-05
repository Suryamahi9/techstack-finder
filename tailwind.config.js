/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        elevated: 'var(--elevated)',
        fg: 'var(--fg)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        secondary: 'var(--secondary)',
        'secondary-soft': 'var(--secondary-soft)',
        surface: 'var(--surface)',
        'tag-red-bg': 'var(--tag-red-bg)',
        'tag-red-fg': 'var(--tag-red-fg)',
        'tag-blue-bg': 'var(--tag-blue-bg)',
        'tag-blue-fg': 'var(--tag-blue-fg)',
        'tag-green-bg': 'var(--tag-green-bg)',
        'tag-green-fg': 'var(--tag-green-fg)',
        'tag-yellow-bg': 'var(--tag-yellow-bg)',
        'tag-yellow-fg': 'var(--tag-yellow-fg)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-view': 'fadeInView 1s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.6s linear infinite',
        'pulse-glow': 'pulseGlow 2.4s ease-in-out infinite',
        'live-pulse': 'livePulse 3s ease-in-out infinite',
        'orb-drift-1': 'orbDrift1 20s ease-in-out infinite',
        'orb-drift-2': 'orbDrift2 25s ease-in-out infinite',
        'sweep-rotate': 'sweepRotate 6s linear infinite',
        'fade-scale': 'fadeScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'ping-slow': 'pingSlow 3s ease-in-out infinite',
        'float-subtle': 'floatSubtle 4s ease-in-out infinite',
        'ticker-scroll': 'tickerScroll 30s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' },
        },
        livePulse: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        orbDrift1: {
          '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
          '50%': { transform: 'translateX(calc(-50% + 40px)) translateY(20px)' },
        },
        orbDrift2: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '33%': { transform: 'translate(-30px, 40px)' },
          '66%': { transform: 'translate(20px, -20px)' },
        },
        fadeInView: {
          '0%': { opacity: '0', transform: 'translateY(40px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
