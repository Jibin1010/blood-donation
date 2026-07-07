/**
 * Shared Tailwind CSS Configuration for LifeLink
 * Supports both landing page (blood colors) and dashboard (primary/secondary colors)
 */
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Outfit', 'sans-serif'],
            },
            colors: {
                // Primary Dashboard Colors (Teal theme)
                primary: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                    700: '#0f766e',
                    900: '#134e4a',
                },
                // Secondary / Emergency Colors (Red theme)
                secondary: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    500: '#ef4444',
                    600: '#dc2626',
                },
                // Landing Page Blood Theme
                blood: {
                    50: '#fdf2f2',
                    100: '#fde8e8',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                    900: '#7f1d1d',
                }
            }
        }
    }
};
