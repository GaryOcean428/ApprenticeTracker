import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // Brand colors
        primary: {
          light: '#6366f1', // Purple from your CRM7 logo
          DEFAULT: '#4f46e5',
          dark: '#4338ca',
        },
        // Success colors (for positive metrics)
        success: {
          light: '#34d399', // Light green for indicators
          DEFAULT: '#10b981', // Medium green for text
          dark: '#059669',   // Dark green for hover states
        },
        // Danger colors (for negative metrics)
        danger: {
          light: '#f87171', // Light red for indicators
          DEFAULT: '#ef4444', // Medium red for text
          dark: '#dc2626',  // Dark red for hover states
        },
        // Neutral colors for light theme
        light: {
          bg: {
            primary: '#ffffff',
            secondary: '#f9fafb',
            tertiary: '#f3f4f6',
          },
          text: {
            primary: '#111827',
            secondary: '#4b5563',
            tertiary: '#6b7280',
          },
        },
        // Dark theme colors with blues and neons
        dark: {
          bg: {
            primary: '#0f172a',   // Dark blue background
            secondary: '#1e293b', // Slightly lighter blue for cards
            tertiary: '#334155',  // Even lighter blue for hover states
          },
          text: {
            primary: '#f8fafc',     // Very light blue/white for primary text
            secondary: '#cbd5e1',   // Light blue for secondary text
            tertiary: '#94a3b8',    // Muted blue for tertiary text
          },
          accent: {
            blue: '#3b82f6',      // Neon blue
            purple: '#8b5cf6',    // Neon purple
            green: '#10b981',     // Neon green
            pink: '#ec4899',      // Neon pink
          }
        },
      },
      backgroundImage: {
        'grid-light': 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\' width=\'32\' height=\'32\' fill=\'none\' stroke=\'rgb(0 0 0 / 0.02)\'%3e%3cpath d=\'M0 .5H31.5V32\'/%3e%3c/svg%3e")',
        'grid-dark': 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\' width=\'32\' height=\'32\' fill=\'none\' stroke=\'rgb(255 255 255 / 0.05)\'%3e%3cpath d=\'M0 .5H31.5V32\'/%3e%3c/svg%3e")',
      },
      boxShadow: {
        'card-light': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'neon-blue': '0 0 8px 0 rgba(59, 130, 246, 0.6)',
        'neon-purple': '0 0 8px 0 rgba(139, 92, 246, 0.6)',
        'neon-green': '0 0 8px 0 rgba(16, 185, 129, 0.6)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
