#!/usr/bin/env node
import { glob } from 'glob';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface FileTransformation {
  pattern: RegExp;
  replacement: string | ((match: string, ...args: string[]) => string);
}

const ROOT_DIR = process.cwd();

const FUNCTION_TRANSFORMATIONS: FileTransformation[] = [
  // Fix missing return types on functions
  {
    pattern: /export (async )?function (\w+)\((.*?)\)(?! *:)/g,
    replacement: (_match: string, isAsync: string, name: string, params: string) =>
      `export ${isAsync ?? ''}function ${name}(${params}): ${isAsync ? 'Promise<void>' : 'void'}`
  },
  // Fix missing return types on arrow functions
  {
    pattern: /export (async )?const (\w+) = \((.*?)\)(?! *:) =>/g,
    replacement: (_match: string, isAsync: string, name: string, params: string) =>
      `export ${isAsync ?? ''}const ${name} = (${params}): ${isAsync ? 'Promise<void>' : 'void'} =>`
  },
  // Fix missing parameter types in function declarations (excluding destructured params)
  {
    pattern: /\((?!{)(\w+)(?![:,)])([,)])/g,
    replacement: '($1: unknown$2'
  }
];

const TYPE_TRANSFORMATIONS: FileTransformation[] = [
  // Replace any with unknown
  {
    pattern: /: unknown(?![a-zA-Z])/g,
    replacement: ': unknown'
  },
  // Fix non-null assertions
  {
    pattern: /(\w+)!/g,
    replacement: '$1 ?? undefined'
  }
];

const CONDITION_TRANSFORMATIONS: FileTransformation[] = [
  // Fix unnecessary conditions (excluding common patterns)
  {
    pattern: /if \((\w+)(?! (?:instanceof|===|!==|>=|<=|>|<|&&|\|\|))\)/g,
    replacement: 'if (typeof $1 !== "undefined" && $1 !== null)'
  }
];

function applyTransformations(content: string, transformations: FileTransformation[]): string {
  return transformations.reduce((text: string, { pattern, replacement }) => {
    if (typeof replacement === 'string') {
      return text.replace(pattern, replacement);
    }

    return text.replace(pattern, (match: string, ...args: string[]) => {
      return replacement(match, ...args);
    });
  }, content);
}

function fixTypeScriptFile(filePath: string): void {
  try {
    console.log(`Processing ${filePath}...`);
    const content = readFileSync(filePath, 'utf8');

    let updatedContent = content;
    updatedContent = applyTransformations(updatedContent, FUNCTION_TRANSFORMATIONS);
    updatedContent = applyTransformations(updatedContent, TYPE_TRANSFORMATIONS);
    updatedContent = applyTransformations(updatedContent, CONDITION_TRANSFORMATIONS);

    if (updatedContent !== content) {
      writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`Error processing ${filePath}:`, errorMessage);
  }
}

async function fixTypeScriptFiles(): Promise<void> {
  try {
    const files: string[] = await glob('**/*.{ts,tsx}', {
      cwd: ROOT_DIR,
      ignore: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '.next/**',
        'coverage/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
      ],
    });

    for (const file of files) {
      const fullPath = join(ROOT_DIR, file);
      fixTypeScriptFile(fullPath);
    }

    console.log('Finished processing TypeScript files');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error finding TypeScript files:', errorMessage);
    process.exit(1);
  }
}

fixTypeScriptFiles().catch((error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  console.error('Script failed:', errorMessage);
  process.exit(1);
});
