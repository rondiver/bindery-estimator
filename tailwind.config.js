/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary accent colors - Electric Blue gradient
        accent: {
          DEFAULT: '#0052FF',
          light: '#4D7CFF',
          dark: '#0041CC',
          50: '#E6EDFF',
          100: '#CCE0FF',
          200: '#99C2FF',
          300: '#66A3FF',
          400: '#3385FF',
          500: '#0052FF',
          600: '#0041CC',
          700: '#003199',
          800: '#002066',
          900: '#001033',
        },
        // Surface colors
        surface: {
          DEFAULT: '#FAFAFA',
          elevated: '#FFFFFF',
          inverted: '#0F172A',
        },
        // Extended slate for better control
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
      },
      fontFamily: {
        display: ['var(--font-calistoga)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Display sizes for headlines
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        // Label sizes (for mono section labels)
        'label-lg': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        'label-md': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        'label-sm': ['0.625rem', { lineHeight: '1.4', letterSpacing: '0.08em' }],
      },
      boxShadow: {
        // Layered elevation system
        'elevation-1': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'elevation-2': '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'elevation-3': '0 4px 8px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'elevation-4': '0 8px 16px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)',
        'elevation-5': '0 16px 32px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05)',
        // Accent-tinted shadows for primary elements
        'accent-sm': '0 2px 8px rgba(0, 82, 255, 0.15)',
        'accent-md': '0 4px 16px rgba(0, 82, 255, 0.2)',
        'accent-lg': '0 8px 32px rgba(0, 82, 255, 0.25)',
      },
      borderRadius: {
        'sm': '0.375rem',
        'DEFAULT': '0.5rem',
        'md': '0.625rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
      },
      backgroundImage: {
        // Gradient backgrounds
        'gradient-accent': 'linear-gradient(135deg, #0052FF 0%, #4D7CFF 100%)',
        'gradient-accent-hover': 'linear-gradient(135deg, #0041CC 0%, #3366FF 100%)',
        'gradient-subtle': 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        'gradient-card': 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',
        // Radial glow for accents
        'glow-accent': 'radial-gradient(circle at center, rgba(0, 82, 255, 0.15) 0%, transparent 70%)',
        // Dot pattern for textures
        'dots': 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)',
      },
      backgroundSize: {
        'dots': '24px 24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
