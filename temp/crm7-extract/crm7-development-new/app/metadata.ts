import type { Metadata } from 'next';

export const siteConfig = {
  name: 'Labour Hire CRM',
  description: 'A modern CRM for labour hire companies',
  url: 'https://crm7.vercel.app',
};

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: {
      url: '/apple-icon.png',
      type: 'image/png',
      sizes: '180x180',
    },
    other: [
      {
        rel: 'icon',
        url: '/icon-192.png',
        type: 'image/png',
        sizes: '192x192',
      },
      {
        rel: 'icon',
        url: '/icon-512.png',
        type: 'image/png',
        sizes: '512x512',
      },
    ],
  },
  manifest: '/site.webmanifest',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};
