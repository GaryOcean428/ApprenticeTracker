/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:5145'],
    },
    optimizePackageImports: [
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      'lucide-react',
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['app', 'components', 'lib', 'types', 'utils'],
  },
  webpack: (config, { webpack }) => {
    config.resolve.alias['@/hooks'] = path.join(__dirname, 'hooks');

    // Ignore punycode deprecation warning
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ },
      { message: /Critical dependency: the request of a dependency is an expression/ }
    ];

    // Add environment variables to suppress deprecation warnings
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.EnvironmentPlugin({
        NODE_NO_WARNINGS: '1'
      })
    );

    return config;
  },
  // Add security headers
  headers: async () => [
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
          value: 'DENY',
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
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ],
};

export default nextConfig;
