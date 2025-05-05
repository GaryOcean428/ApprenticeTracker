// filepath: /home/braden/Desktop/Dev/crm7r/next.config.mjs
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:4200', 'localhost:5145', 'localhost:5146', 'localhost:5147'],
    },
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', 'date-fns', 'recharts'],
    webpackBuildWorker: true,
    instrumentationHook: true,
    serverComponentsExternalPackages: ['sharp'],
  },
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    };

    // Add support for WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Fix for require-in-the-middle critical dependency warning
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'module': false,
        'dns': false, 
        'fs': false,
        'tls': false,
        'net': false,
        'http': false,
        'https': false,
        'path': false,
        'stream': false,
        'zlib': false,
        'child_process': false,
        'os': false,
        'util': false,
      };
    }

    // Handle the critical dependency warning from require-in-the-middle
    config.module = {
      ...config.module,
      exprContextCritical: false,
      unknownContextCritical: false,
    };

    // Ignore require-in-the-middle warnings
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { message: /Critical dependency: require function is used/ },
      { message: /Critical dependency: the request of a dependency is an expression/ },
      /Critical dependency/,
    ];
    
    // For Next.js 15.3+, we need to update transpilePackages
    if (Array.isArray(config.transpilePackages)) {
      config.transpilePackages.push('@sentry/nextjs');
    } else {
      config.transpilePackages = ['@sentry/nextjs'];
    }

    return config;
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
