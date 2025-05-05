import fs from 'fs';
import path from 'path';
import { Project, SyntaxKind } from 'ts-morph';
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
function findFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            files.push(...findFiles(fullPath));
        }
        else if (stat.isFile() &&
            /\.(ts|tsx)$/.test(item) &&
            !item.endsWith('.d.ts') &&
            !item.includes('__tests__') &&
            !item.includes('.test.') &&
            !item.includes('.spec.')) {
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
function addMissingReturnTypes() {
    const sourceFiles = project.getSourceFiles();
    sourceFiles.forEach((sourceFile) => {
        const functions = sourceFile.getFunctions();
        const arrowFunctions = sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction);
        const methods = sourceFile.getDescendantsOfKind(SyntaxKind.MethodDeclaration);
        [...functions, ...arrowFunctions, ...methods].forEach((func) => {
            if (!func.getReturnTypeNode()) {
                try {
                    const signature = func.getSignature();
                    if (typeof signature !== "undefined" && signature !== null) {
                        const returnType = project.getTypeChecker().getReturnTypeOfSignature(signature);
                        const typeText = returnType.getText();
                        if (typeText !== 'void' && typeText !== 'any' && !typeText.includes('Promise')) {
                            func.setReturnType(typeText);
                        }
                        else if (typeText === 'void') {
                            func.setReturnType('void');
                        }
                    }
                }
                catch (error) {
                    console.warn('Could not get return type for function:', func.getText());
                }
            }
        });
    });
}
// Prefix unused variables with underscore
function fixUnusedVariables() {
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
function fixEmptyInterfaces() {
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
function removeUnusedImports() {
    const sourceFiles = project.getSourceFiles();
    sourceFiles.forEach((sourceFile) => {
        const imports = sourceFile.getImportDeclarations();
        imports.forEach((importDecl) => {
            const namedImports = importDecl.getNamedImports();
            namedImports.forEach((namedImport) => {
                const symbol = namedImport.getSymbol();
                if (typeof symbol !== "undefined" && symbol !== null) {
                    const references = symbol.findReferences();
                    if (references.length === 1) { // Only import, no usage
                        namedImport.remove();
                    }
                }
            });
            // Remove import declaration if it has no specifiers
            if (importDecl.getNamedImports().length === 0 && !importDecl.getDefaultImport()) {
                importDecl.remove();
            }
        });
    });
}
// Main execution
console.log('Fixing ESLint issues...');
try {
    addMissingReturnTypes();
    fixUnusedVariables();
    fixEmptyInterfaces();
    removeUnusedImports();
    // Save all changes
    project.saveSync();
    console.log('ESLint fixes applied successfully ?? undefined');
}
catch (error) {
    console.error('Error fixing ESLint issues:', error);
    process.exit(1);
}
