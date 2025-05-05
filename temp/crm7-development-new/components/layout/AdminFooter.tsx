import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';

export function AdminFooter() {
  const { user } = useAuth();

  const isAdmin = user?.email === 'braden.lang77@gmail.com';

  if (!isAdmin) return null;

  return (
    <footer className="fixed bottom-4 right-4 opacity-50 hover:opacity-100 transition-opacity">
      <Link
        href="/admin/editor"
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Admin Editor
      </Link>
    </footer>
  );
}
