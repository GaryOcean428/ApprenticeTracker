import fs from 'fs';
import path from 'path';
import { Project, SyntaxKind } from 'ts-morph';
import { loggerModule as logger } from './logger';

const project = new Project({
  tsConfigFilePath: path.join(process.cwd(), 'tsconfig.json'),
  skipAddingFilesFromTsConfig: true,
});

const rootDir = process.cwd();

// Add source files
const srcFiles = [
  ...findFiles(path.join(rootDir, 'app')),
  ...findFiles(path.join(rootDir, 'components')),
  ...findFiles(path.join(rootDir, 'lib')),
  ...findFiles(path.join(rootDir, 'pages')),
];

function findFiles(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findFiles(fullPath));
    } else if (
      stat.isFile() &&
      /\.(ts|tsx)$/.test(item) &&
      !item.endsWith('.d.ts') &&
      !item.includes('__tests__') &&
      !item.includes('.test.') &&
      !item.includes('.spec.')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

// Add source files to project
srcFiles.forEach(filePath => {
  project.addSourceFileAtPath(filePath);
});

// Add return types to functions
function addMissingReturnTypes(): void {
  const sourceFiles = project.getSourceFiles();
  const typeChecker = project.getTypeChecker();

  sourceFiles.forEach((sourceFile) => {
    const functions = sourceFile.getFunctions();
    const arrowFunctions = sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction);
    const methods = sourceFile.getDescendantsOfKind(SyntaxKind.MethodDeclaration);

    [...functions, ...arrowFunctions, ...methods].forEach((func) => {
      // Skip array method callbacks and React event handlers
      const isArrayMethodCallback = func.getParent()?.getKind() === SyntaxKind.CallExpression &&
        ['map', 'filter', 'reduce', 'forEach', 'find', 'findIndex'].some(method =>
          func.getParent()?.getText().includes(`.${method}(`));
      
      const isEventHandler = func.getParent()?.getText().includes('onClick=') ||
        func.getParent()?.getText().includes('onChange=') ||
        func.getParent()?.getText().includes('onSubmit=');

      if (isArrayMethodCallback || isEventHandler) {
        return;
      }

      if (!func.getReturnTypeNode()) {
        try {
          const signature = func.getSignature();
          if (!signature) {
            return;
          }

          const returnType = typeChecker.getReturnTypeOfSignature(signature);
          if (!returnType) {
            return;
          }

          const typeText = returnType.getText();
          const isReactComponent = sourceFile.getFilePath().endsWith('.tsx') && 
            (func.getFirstAncestorByKind(SyntaxKind.VariableDeclaration)?.getType().getText().includes('React.') || false);

          // Handle different cases
          if (isReactComponent) {
            func.setReturnType('React.ReactElement');
          } else if (typeText.includes('Promise')) {
            const promiseType = typeText.match(/Promise<(.+)>/)?.[1] || 'unknown';
            func.setReturnType(`Promise<${promiseType}>`);
          } else if (typeText !== 'any' && !typeText.includes('unknown')) {
            func.setReturnType(typeText);
          }
        } catch (error) {
          const location = sourceFile.getFilePath();
          let functionName = 'anonymous';
          
          // Try to get the function name from various possible locations
          const varDecl = func.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
          const methodDecl = func.getFirstAncestorByKind(SyntaxKind.MethodDeclaration);
          const funcDecl = func.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration);
          
          if (varDecl) {
            functionName = varDecl.getName();
          } else if (methodDecl) {
            functionName = methodDecl.getName();
          } else if (funcDecl) {
            functionName = funcDecl.getName();
          }
          
          logger.warn(
            `Could not infer return type for function "${functionName}" in ${location}:`,
            `\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
            `\nFunction text: ${func.getText().slice(0, 100)}...`
          );
        }
      }
    });
  });
}

// Prefix unused variables with underscore
function fixUnusedVariables(): void {
  const sourceFiles = project.getSourceFiles();

  sourceFiles.forEach((sourceFile) => {
    const variables = sourceFile.getVariableDeclarations();
    const parameters = sourceFile.getDescendantsOfKind(SyntaxKind.Parameter);
    const catchClauses = sourceFile.getDescendantsOfKind(SyntaxKind.CatchClause);

    variables.forEach((variable) => {
      const references = variable.findReferences();
      if (references.length === 1) { // Only declaration, no usage
        const name = variable.getName();
        if (!name.startsWith('_')) {
          variable.rename('_' + name);
        }
      }
    });

    parameters.forEach((param) => {
      const references = param.findReferences();
      if (references.length === 1) { // Only declaration, no usage
        const name = param.getName();
        if (!name.startsWith('_')) {
          param.rename('_' + name);
        }
      }
    });

    catchClauses.forEach((catchClause) => {
      const variableDeclaration = catchClause.getVariableDeclaration();
      if (typeof variableDeclaration !== "undefined" && variableDeclaration !== null) {
        const references = variableDeclaration.findReferences();
        if (references.length === 1) { // Only declaration, no usage
          const name = variableDeclaration.getName();
          if (!name.startsWith('_')) {
            variableDeclaration.rename('_' + name);
          }
        }
      }
    });
  });
}

// Fix empty interfaces
function fixEmptyInterfaces(): void {
  const sourceFiles = project.getSourceFiles();

  sourceFiles.forEach((sourceFile) => {
    const interfaces = sourceFile.getInterfaces();

    interfaces.forEach((interfaceDecl) => {
      if (interfaceDecl.getMembers().length === 0) {
        interfaceDecl.addProperty({
          name: 'props',
          type: 'Record<string, unknown>',
        });
      }
    });
  });
}

// Remove unused imports
function removeUnusedImports(): void {
  const sourceFiles = project.getSourceFiles();

  sourceFiles.forEach(sourceFile => {
    const importDeclarations = sourceFile.getImportDeclarations();
    const allIdentifiers = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier);
    
    // First collect all imports to remove
    const importsToRemove: { 
      importDecl: ImportDeclaration; 
      namedImport: ImportSpecifier;
    }[] = [];
    
    importDeclarations.forEach(importDecl => {
      const namedImports = importDecl.getNamedImports();
      
      namedImports.forEach(namedImport => {
        const importName = namedImport.getName();
        
        // Check if the import is used anywhere else in the file
        const isUsed = allIdentifiers.some(identifier => 
          identifier.getText() === importName && 
          !identifier.getParent()?.isKind(SyntaxKind.ImportSpecifier)
        );
        
        if (!isUsed) {
          importsToRemove.push({ importDecl, namedImport });
        }
      });
    });
    
    // Then remove them all at once
    importsToRemove.forEach(({ importDecl, namedImport }) => {
      try {
        namedImport.remove();
        
        // Remove the entire import if it has no named imports left
        if (importDecl.getNamedImports().length === 0 && !importDecl.getDefaultImport()) {
          importDecl.remove();
        }
      } catch (error) {
        // Ignore errors from already removed nodes
        if (!(error instanceof Error && error.message.includes('removed or forgotten'))) {
          throw error;
        }
      }
    });
  });
}

// Main execution
logger.info('Fixing ESLint issues...');

try {
  addMissingReturnTypes();
  project.saveSync();
  
  removeUnusedImports();
  project.saveSync();
  
  logger.info('Successfully fixed ESLint issues');
} catch (error) {
  logger.error('Error fixing ESLint issues:', error);
}
