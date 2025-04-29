import { Inter } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import AuthProvider from '@/lib/auth/context';
import { createClient } from '@/utils/supabase/server';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Providers } from '@/components/providers';
import { logger } from '@/lib/logger';

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      logger.error('Failed to get user in root layout', { error });
      return (
        <html lang="en" suppressHydrationWarning>
          <head>
            <title>Labour Hire CRM</title>
            <meta name="description" content="A modern CRM for labour hire companies" />
          </head>
          <body className={inter.className}>
            <Providers>
              <ErrorBoundary>{children}</ErrorBoundary>
            </Providers>
          </body>
        </html>
      );
    }

    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>Labour Hire CRM</title>
          <meta name="description" content="A modern CRM for labour hire companies" />
        </head>
        <body className={inter.className}>
          <Providers>
            <ErrorBoundary>
              {user ? (
                <AppLayout>{children}</AppLayout>
              ) : (
                children
              )}
            </ErrorBoundary>
          </Providers>
        </body>
      </html>
    );
  } catch (err) {
    logger.error('Unexpected error in root layout', { error: err });
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>Labour Hire CRM</title>
          <meta name="description" content="A modern CRM for labour hire companies" />
        </head>
        <body className={inter.className}>
          <Providers>
            <ErrorBoundary>{children}</ErrorBoundary>
          </Providers>
        </body>
      </html>
    );
  }
}
