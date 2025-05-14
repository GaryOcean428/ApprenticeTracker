import { readFileSync, writeFileSync } from 'fs';

// List of schema files to process
const schemaFiles = [
  './shared/schema.ts',
  './shared/schema/contacts.ts',
  './shared/schema/labour-hire.ts',
  './shared/schema/clients.ts',
];

// Function to fix schema types
function fixSchemaTypes(filePath) {
  console.log(`Processing ${filePath}...`);
  
  let content = readFileSync(filePath, 'utf8');
  
  // Fix .omit({...}) patterns - add as const
  content = content.replace(/\.omit\(\{([^}]+)\}\)/g, '.omit({$1} as const)');
  
  // Fix .pick({...}) patterns - add as const
  content = content.replace(/\.pick\(\{([^}]+)\}\)/g, '.pick({$1} as const)');
  
  // Write the updated content back to the file
  writeFileSync(filePath, content);
  console.log(`✓ Fixed schema types in ${filePath}`);
}

// Process all schema files
for (const filePath of schemaFiles) {
  try {
    fixSchemaTypes(filePath);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

console.log('Schema type fixes completed.');