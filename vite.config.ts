import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(async ({ mode }) => {
  const plugins = [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ];

  // Add bundle analysis in production builds
  if (mode === 'production') {
    plugins.push(
      visualizer({
        filename: 'dist/bundle-analysis.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      })
    );
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            // React ecosystem
            'react-vendor': ['react', 'react-dom', 'wouter'],
            // Large UI component libraries
            'radix-ui': [
              '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs',
              '@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-avatar',
              '@radix-ui/react-checkbox', '@radix-ui/react-collapsible', '@radix-ui/react-context-menu',
              '@radix-ui/react-hover-card', '@radix-ui/react-label', '@radix-ui/react-menubar',
              '@radix-ui/react-navigation-menu', '@radix-ui/react-popover', '@radix-ui/react-progress',
              '@radix-ui/react-radio-group', '@radix-ui/react-scroll-area', '@radix-ui/react-select',
              '@radix-ui/react-separator', '@radix-ui/react-slider', '@radix-ui/react-slot',
              '@radix-ui/react-switch', '@radix-ui/react-toast', '@radix-ui/react-toggle',
              '@radix-ui/react-toggle-group', '@radix-ui/react-tooltip'
            ],
            // Forms and validation
            'forms-vendor': ['react-hook-form', '@hookform/resolvers', 'zod', 'zod-validation-error'],
            // Data fetching
            'query-vendor': ['@tanstack/react-query', 'axios'],
            // Icons and assets
            'icons-vendor': ['lucide-react', 'react-icons'],
            // Charts and visualization
            'charts-vendor': ['recharts'],
            // Utilities and helpers
            'utils-vendor': ['clsx', 'tailwind-merge', 'date-fns', 'class-variance-authority']
          },
        },
      },
      chunkSizeWarningLimit: 500, // Warn for chunks larger than 500KB
    },
  };
});
