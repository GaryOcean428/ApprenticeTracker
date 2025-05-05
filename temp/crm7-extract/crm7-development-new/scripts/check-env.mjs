#!/usr/bin/env node

/**
 * Check required environment variables for the application
 */

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const missingVars = requiredVars.filter(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    return true;
  }
  return false;
});

if (missingVars.length > 0) {
  console.error(`\n❌ Found ${missingVars.length} missing environment variables.`);
  console.error('Please check your .env.local or .env file and make sure all required variables are set.');
  process.exit(1);
}

console.log('✅ All required environment variables are set.');
