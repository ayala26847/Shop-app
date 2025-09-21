// Enhanced TypeScript configuration

export const strictTypeScriptConfig = {
  compilerOptions: {
    // Strict type checking
    strict: true,
    noImplicitAny: true,
    strictNullChecks: true,
    strictFunctionTypes: true,
    strictBindCallApply: true,
    strictPropertyInitialization: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    noUncheckedIndexedAccess: true,
    noImplicitOverride: true,
    
    // Advanced type checking
    exactOptionalPropertyTypes: true,
    noPropertyAccessFromIndexSignature: true,
    noUncheckedIndexedAccess: true,
    
    // Module resolution
    moduleResolution: 'bundler',
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    resolveJsonModule: true,
    isolatedModules: true,
    
    // Emit
    declaration: true,
    declarationMap: true,
    sourceMap: true,
    removeComments: false,
    importHelpers: true,
    
    // Interop constraints
    allowUnusedLabels: false,
    allowUnreachableCode: false,
    noImplicitThis: true,
    useUnknownInCatchVariables: true,
  },
  include: ['src/**/*'],
  exclude: ['node_modules', 'dist', 'build', '**/*.test.ts', '**/*.spec.ts'],
};
