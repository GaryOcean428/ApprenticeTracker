import { cookies } from 'next/headers';

// Example usage in a Server Component
export async function getCookies() {
  const cookieStore = cookies();
  
  // Log the type
  console.log('Cookie store type:', typeof cookieStore);
  console.log('Cookie store is Promise:', cookieStore instanceof Promise);
  
  // Try to access methods
  console.log('get method:', typeof cookieStore.get);
  console.log('set method:', typeof cookieStore.set);

  // Test operations
  const testCookie = cookieStore.get('test-cookie');
  console.log('Test cookie:', testCookie);
  
  return cookieStore;
}
