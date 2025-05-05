// filepath: /home/braden/Desktop/Dev/crm7r/utils/supabase/client-adapter.ts
// 
// DEPRECATED: This file is kept for backward compatibility
// Please use utils/supabase/server.ts or utils/supabase/client.ts instead
//

import { createClient as serverCreateClient, createAdminClient as serverCreateAdminClient } from './server';

/**
 * @deprecated Use utils/supabase/server.ts instead
 */
export async function createClient(request?: Request) {
  console.warn('utils/supabase/client-adapter.ts is deprecated. Use utils/supabase/server.ts instead.');
  if (!request) {
    // Create a mock request object for backward compatibility
    const mockRequest = new Request('http://localhost');
    return await serverCreateClient(mockRequest);
  }
  return await serverCreateClient(request);
}

/**
 * @deprecated Use utils/supabase/server.ts createAdminClient() instead
 */
export async function createAdminClient() {
  console.warn('utils/supabase/client-adapter.ts is deprecated. Use utils/supabase/server.ts createAdminClient() instead.');
  return await serverCreateAdminClient();
}
