/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                tivit: {
                    // Base backgrounds - Deep rich darks
                    dark: '#050505',      // Main background (near black)
                    card: '#070707',      // Card background
                    surface: '#0A0A0A',   // Hover/Secondary surface

                    // Accents
                    red: '#ED1C24',       // Primary Brand Red
                    'red-glow': '#ef4444', // For lighting effects

                    // Text hierarchies (Zinc/Slate based)
                    text: '#FAFAFA',      // Primary Text
                    muted: '#A1A1AA',     // Secondary Text
                    dim: '#52525B',       // Tertiary/Borders
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                poppins: ['Poppins', 'sans-serif'],
                nunito: ['"Nunito Sans"', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-up': 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'glass': 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            }
        },
    },
    plugins: [
        function ({ addUtilities }) {
            const newUtilities = {
                '.text-stroke': {
                    '-webkit-text-stroke': '1px var(--tw-text-stroke-color, currentColor)',
                },
                '.text-stroke-2': {
                    '-webkit-text-stroke': '2px var(--tw-text-stroke-color, currentColor)',
                },
                '.text-stroke-3': {
                    '-webkit-text-stroke': '3px var(--tw-text-stroke-color, currentColor)',
                },
                '.text-stroke-red': {
                    '--tw-text-stroke-color': '#ED1C24',
                },
            }
            addUtilities(newUtilities)
        }
    ],
}
