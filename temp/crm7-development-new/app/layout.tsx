import { Inter } from 'next/font/google';
import './globals.css';
import { createClient } from '@/utils/supabase/client';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Providers } from '@/components/providers';
import { logger } from '@/lib/logger';
// Export metadata directly to avoid unused variable warning

const inter = Inter({ subsets: ['latin'] });

export { metadata } from './metadata';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactElement> {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.getUser();

    if (error) {
      logger.error('Failed to get user in root layout', { error });
    }

    return (
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <Providers>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </Providers>
        </body>
      </html>
    );
  } catch (err) {
    logger.error('Unexpected error in root layout', { error: err });
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <Providers>
            <ErrorBoundary>{children}</ErrorBoundary>
          </Providers>
        </body>
      </html>
    );
  }
}
