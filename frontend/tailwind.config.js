/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#FF6B6B', // Warm Coral Red
                    hover: '#FA5252',
                },
                secondary: {
                    DEFAULT: '#4ECDC4', // Turquoise
                },
                tertiary: {
                    DEFAULT: '#FFE66D', // Soft Yellow
                },
                neutral: {
                    dark: '#2C3E50', // Deep Navy
                    light: '#F7F9FC', // Off-White
                    glass: 'rgba(255, 255, 255, 0.2)',
                },
                accent: {
                    DEFAULT: '#95E1D3', // Mint Green
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Inter', 'system-ui', 'sans-serif'], // Proxies for SF Pro
                mono: ['JetBrains Mono', 'monospace'],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
        },
    },
    plugins: [],
}
