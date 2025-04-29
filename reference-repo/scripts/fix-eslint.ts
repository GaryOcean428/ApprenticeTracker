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

async function main() {
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

          logger.warn(
            `Added missing return type for method ${methodDecl.getName()} in ${file}`
          );
        }
      }

      // Process function declarations
      for (const funcDecl of functionDeclarations) {
        if (!funcDecl.getReturnTypeNode()) {
          const returnType = funcDecl.getReturnType();
          funcDecl.setReturnType(returnType.getText());
          fileModified = true;

          const name = funcDecl.getName();
          if (name) {
            logger.warn(
              `Added missing return type for function ${name} in ${file}`
            );
          }
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
            const name = methodDecl.getName();
            if (name) functionName = name;
          } else if (funcDecl) {
            const name = funcDecl.getName();
            if (name) functionName = name;
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
