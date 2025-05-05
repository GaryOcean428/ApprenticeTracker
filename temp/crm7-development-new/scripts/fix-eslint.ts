#!/usr/bin/env node
import { glob } from 'glob';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Project, SyntaxKind } from 'ts-morph';
import { logger } from '@/lib/utils/logger';

const project = new Project({
  tsConfigFilePath: join(process.cwd(), 'tsconfig.json'),
  skipAddingFilesFromTsConfig: true,
});

async function main(): Promise<void> {
  try {
    const files = await glob('**/*.ts', {
      ignore: ['node_modules/**', 'dist/**', '.next/**', 'coverage/**'],
      cwd: process.cwd(),
    });

    for (const file of files) {
      const sourceFile = project.addSourceFileAtPath(file);
      let fileModified = false;

      // Find all method declarations
      const methodDeclarations = sourceFile.getDescendantsOfKind(SyntaxKind.MethodDeclaration);
      const functionDeclarations = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);

      // Process method declarations
      for (const methodDecl of methodDeclarations) {
        if (!methodDecl.getReturnTypeNode()) {
          const returnType = methodDecl.getReturnType();
          methodDecl.setReturnType(returnType.getText());
          fileModified = true;

          const methodName = methodDecl.getName() ?? 'anonymous method';
          logger.warn(
            `Added missing return type for method ${methodName} in ${file}`
          );
        }
      }

      // Process function declarations
      for (const funcDecl of functionDeclarations) {
        if (!funcDecl.getReturnTypeNode()) {
          const returnType = funcDecl.getReturnType();
          funcDecl.setReturnType(returnType.getText());
          fileModified = true;

          const functionName = funcDecl.getName() ?? 'anonymous function';
          logger.warn(
            `Added missing return type for function ${functionName} in ${file}`
          );
        }
      }

      // Find all any type annotations
      const anyTypes = sourceFile.getDescendantsOfKind(SyntaxKind.TypeReference);
      for (const anyType of anyTypes) {
        if (anyType.getText() === 'any') {
          // Get the parent node to determine context
          const parent = anyType.getParent();
          let functionName = 'unknown';

          // Try to get function/method name for better error messages
          const methodDecl = parent?.getFirstAncestorByKind(SyntaxKind.MethodDeclaration);
          const funcDecl = parent?.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration);

          if (methodDecl) {
            functionName = methodDecl.getName() ?? functionName;
          } else if (funcDecl) {
            functionName = funcDecl.getName() ?? functionName;
          }

          logger.warn(
            `Found 'any' type in ${functionName} (${file}). Consider using a more specific type.`
          );
        }
      }

      if (fileModified) {
        writeFileSync(file, sourceFile.getFullText());
        logger.info(`Updated ${file}`);
      }
    }
  } catch (error) {
    logger.error('Error fixing ESLint issues:', { error });
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Unhandled error:', { error });
  process.exit(1);
});
