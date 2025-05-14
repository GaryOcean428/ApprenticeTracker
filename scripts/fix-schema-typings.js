import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// List of schema files to process
const schemaFiles = [
  './shared/schema.ts',
  './shared/schema/contacts.ts',
  './shared/schema/labour-hire.ts',
  './shared/schema/clients.ts',
];

// Function to fix omit types in schema files
function fixOmitTypes(filePath) {
  console.log(`Processing ${filePath}...`);
  
  // Read file content
  let content = readFileSync(filePath, 'utf8');
  
  // Find all instances of .omit({ ... }) without as const
  const regex = /\.omit\(\{([^}]+)\}\)/g;
  
  // Replace with .omit({ ... } as const)
  const updatedContent = content.replace(regex, '.omit({$1} as const)');
  
  // Write back to file if changes were made
  if (content !== updatedContent) {
    writeFileSync(filePath, updatedContent);
    console.log(`✓ Fixed omit types in ${filePath}`);
  } else {
    console.log(`No changes needed in ${filePath}`);
  }
}

// Process all schema files
schemaFiles.forEach(filePath => {
  try {
    fixOmitTypes(filePath);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
});

console.log('Schema typing fixes completed.');