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
            // Vendor chunks for better caching and smaller initial bundle
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
            routing: ['wouter'],
            forms: ['react-hook-form', '@hookform/resolvers'],
            query: ['@tanstack/react-query'],
            icons: ['lucide-react', 'react-icons'],
            charts: ['recharts'],
            utils: ['clsx', 'tailwind-merge', 'date-fns']
          },
        },
      },
      chunkSizeWarningLimit: 500, // Warn for chunks larger than 500KB
    },
  };
});
