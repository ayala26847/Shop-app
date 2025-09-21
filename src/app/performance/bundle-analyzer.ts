// Bundle analysis and optimization utilities

import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

export interface BundleInfo {
  name: string;
  size: number;
  gzippedSize: number;
  chunks: string[];
  modules: ModuleInfo[];
  dependencies: string[];
  isVendor: boolean;
  isAsync: boolean;
  isCritical: boolean;
}

export interface ModuleInfo {
  name: string;
  size: number;
  gzippedSize: number;
  type: 'js' | 'css' | 'image' | 'font' | 'other';
  isDuplicate: boolean;
  isUnused: boolean;
}

export interface BundleAnalysis {
  totalSize: number;
  totalGzippedSize: number;
  bundleCount: number;
  moduleCount: number;
  duplicateModules: ModuleInfo[];
  unusedModules: ModuleInfo[];
  largeModules: ModuleInfo[];
  recommendations: string[];
}

export class BundleAnalyzer {
  private bundles: BundleInfo[] = [];
  private analysis: BundleAnalysis | null = null;

  constructor(private config: BundleAnalyzerConfig) {}

  public analyze(bundles: BundleInfo[]): BundleAnalysis {
    this.bundles = bundles;
    
    const analysis: BundleAnalysis = {
      totalSize: this.calculateTotalSize(),
      totalGzippedSize: this.calculateTotalGzippedSize(),
      bundleCount: bundles.length,
      moduleCount: this.calculateModuleCount(),
      duplicateModules: this.findDuplicateModules(),
      unusedModules: this.findUnusedModules(),
      largeModules: this.findLargeModules(),
      recommendations: this.generateRecommendations(),
    };

    this.analysis = analysis;
    return analysis;
  }

  public getOptimizationSuggestions(): string[] {
    if (!this.analysis) {
      throw new Error('Analysis not performed. Call analyze() first.');
    }

    const suggestions: string[] = [];

    // Size-based suggestions
    if (this.analysis.totalSize > 2 * 1024 * 1024) { // 2MB
      suggestions.push('Consider implementing code splitting to reduce initial bundle size');
    }

    // Duplicate module suggestions
    if (this.analysis.duplicateModules.length > 0) {
      suggestions.push(`Found ${this.analysis.duplicateModules.length} duplicate modules. Consider using webpack alias or deduplication`);
    }

    // Unused module suggestions
    if (this.analysis.unusedModules.length > 0) {
      suggestions.push(`Found ${this.analysis.unusedModules.length} unused modules. Consider removing them or implementing tree shaking`);
    }

    // Large module suggestions
    if (this.analysis.largeModules.length > 0) {
      suggestions.push(`Found ${this.analysis.largeModules.length} large modules. Consider lazy loading or splitting them`);
    }

    // Bundle count suggestions
    if (this.analysis.bundleCount > 20) {
      suggestions.push('Consider consolidating bundles to reduce HTTP requests');
    }

    return suggestions;
  }

  public generateWebpackConfig(): any {
    return {
      plugins: [
        new BundleAnalyzerPlugin({
          analyzerMode: this.config.analyzerMode,
          analyzerHost: this.config.analyzerHost,
          analyzerPort: this.config.analyzerPort,
          reportFilename: this.config.reportFilename,
          defaultSizes: this.config.defaultSizes,
          openAnalyzer: this.config.openAnalyzer,
          generateStatsFile: this.config.generateStatsFile,
          statsFilename: this.config.statsFilename,
          statsOptions: this.config.statsOptions,
          logLevel: this.config.logLevel,
        }),
      ],
      optimization: {
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
            },
            styles: {
              name: 'styles',
              test: /\.css$/,
              chunks: 'all',
              enforce: true,
            },
          },
        },
        usedExports: true,
        sideEffects: false,
      },
    };
  }

  public getCriticalBundles(): BundleInfo[] {
    return this.bundles.filter(bundle => bundle.isCritical);
  }

  public getAsyncBundles(): BundleInfo[] {
    return this.bundles.filter(bundle => bundle.isAsync);
  }

  public getVendorBundles(): BundleInfo[] {
    return this.bundles.filter(bundle => bundle.isVendor);
  }

  public getBundleByName(name: string): BundleInfo | undefined {
    return this.bundles.find(bundle => bundle.name === name);
  }

  public getLargestBundles(count: number = 10): BundleInfo[] {
    return this.bundles
      .sort((a, b) => b.size - a.size)
      .slice(0, count);
  }

  public getSmallestBundles(count: number = 10): BundleInfo[] {
    return this.bundles
      .sort((a, b) => a.size - b.size)
      .slice(0, count);
  }

  public getBundlesBySize(minSize: number, maxSize?: number): BundleInfo[] {
    return this.bundles.filter(bundle => {
      if (maxSize) {
        return bundle.size >= minSize && bundle.size <= maxSize;
      }
      return bundle.size >= minSize;
    });
  }

  public getDuplicateModules(): ModuleInfo[] {
    if (!this.analysis) {
      throw new Error('Analysis not performed. Call analyze() first.');
    }
    return this.analysis.duplicateModules;
  }

  public getUnusedModules(): ModuleInfo[] {
    if (!this.analysis) {
      throw new Error('Analysis not performed. Call analyze() first.');
    }
    return this.analysis.unusedModules;
  }

  public getLargeModules(): ModuleInfo[] {
    if (!this.analysis) {
      throw new Error('Analysis not performed. Call analyze() first.');
    }
    return this.analysis.largeModules;
  }

  private calculateTotalSize(): number {
    return this.bundles.reduce((total, bundle) => total + bundle.size, 0);
  }

  private calculateTotalGzippedSize(): number {
    return this.bundles.reduce((total, bundle) => total + bundle.gzippedSize, 0);
  }

  private calculateModuleCount(): number {
    return this.bundles.reduce((total, bundle) => total + bundle.modules.length, 0);
  }

  private findDuplicateModules(): ModuleInfo[] {
    const moduleMap = new Map<string, ModuleInfo[]>();
    
    this.bundles.forEach(bundle => {
      bundle.modules.forEach(module => {
        if (!moduleMap.has(module.name)) {
          moduleMap.set(module.name, []);
        }
        moduleMap.get(module.name)!.push(module);
      });
    });

    const duplicates: ModuleInfo[] = [];
    moduleMap.forEach(modules => {
      if (modules.length > 1) {
        modules.forEach(module => {
          module.isDuplicate = true;
          duplicates.push(module);
        });
      }
    });

    return duplicates;
  }

  private findUnusedModules(): ModuleInfo[] {
    // This would require more sophisticated analysis
    // For now, return modules that are marked as unused
    const unused: ModuleInfo[] = [];
    
    this.bundles.forEach(bundle => {
      bundle.modules.forEach(module => {
        if (module.isUnused) {
          unused.push(module);
        }
      });
    });

    return unused;
  }

  private findLargeModules(): ModuleInfo[] {
    const largeModules: ModuleInfo[] = [];
    const threshold = 100 * 1024; // 100KB

    this.bundles.forEach(bundle => {
      bundle.modules.forEach(module => {
        if (module.size > threshold) {
          largeModules.push(module);
        }
      });
    });

    return largeModules.sort((a, b) => b.size - a.size);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.analysis!.duplicateModules.length > 0) {
      recommendations.push('Remove duplicate modules to reduce bundle size');
    }

    if (this.analysis!.unusedModules.length > 0) {
      recommendations.push('Remove unused modules to reduce bundle size');
    }

    if (this.analysis!.largeModules.length > 0) {
      recommendations.push('Consider splitting large modules into smaller chunks');
    }

    if (this.analysis!.totalSize > 1024 * 1024) { // 1MB
      recommendations.push('Consider implementing lazy loading for non-critical routes');
    }

    return recommendations;
  }
}

export interface BundleAnalyzerConfig {
  analyzerMode: 'server' | 'static' | 'json' | 'disabled';
  analyzerHost: string;
  analyzerPort: number;
  reportFilename: string;
  defaultSizes: 'parsed' | 'gzip';
  openAnalyzer: boolean;
  generateStatsFile: boolean;
  statsFilename: string;
  statsOptions: any;
  logLevel: 'info' | 'warn' | 'error' | 'silent';
}

export const defaultBundleAnalyzerConfig: BundleAnalyzerConfig = {
  analyzerMode: 'static',
  analyzerHost: '127.0.0.1',
  analyzerPort: 8888,
  reportFilename: 'bundle-report.html',
  defaultSizes: 'gzip',
  openAnalyzer: true,
  generateStatsFile: true,
  statsFilename: 'bundle-stats.json',
  statsOptions: {
    source: false,
    modules: false,
    chunks: false,
    chunkModules: false,
  },
  logLevel: 'info',
};
