// Service container for dependency injection

import { IServiceContainer, IService } from './interfaces';

export class ServiceContainer implements IServiceContainer {
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();
  private singletons = new Map<string, any>();

  public register<T>(name: string, service: T): void {
    if (this.services.has(name)) {
      throw new Error(`Service ${name} is already registered`);
    }
    
    this.services.set(name, service);
  }

  public registerFactory<T>(name: string, factory: () => T): void {
    if (this.factories.has(name)) {
      throw new Error(`Service factory ${name} is already registered`);
    }
    
    this.factories.set(name, factory);
  }

  public get<T>(name: string): T {
    // Check if service is already instantiated as singleton
    if (this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    // Check if service is registered directly
    if (this.services.has(name)) {
      const service = this.services.get(name);
      
      // If it's a service class, instantiate it
      if (typeof service === 'function') {
        const instance = new service();
        this.singletons.set(name, instance);
        return instance;
      }
      
      return service;
    }

    // Check if factory is registered
    if (this.factories.has(name)) {
      const factory = this.factories.get(name);
      const instance = factory();
      this.singletons.set(name, instance);
      return instance;
    }

    throw new Error(`Service ${name} is not registered`);
  }

  public has(name: string): boolean {
    return this.services.has(name) || this.factories.has(name) || this.singletons.has(name);
  }

  public remove(name: string): void {
    // Clean up singleton if it exists
    if (this.singletons.has(name)) {
      const service = this.singletons.get(name);
      if (service && typeof service.destroy === 'function') {
        service.destroy();
      }
      this.singletons.delete(name);
    }
    
    this.services.delete(name);
    this.factories.delete(name);
  }

  public clear(): void {
    // Clean up all singletons
    for (const [name, service] of this.singletons) {
      if (service && typeof service.destroy === 'function') {
        service.destroy();
      }
    }
    
    this.services.clear();
    this.factories.clear();
    this.singletons.clear();
  }

  public keys(): string[] {
    const allKeys = new Set([
      ...this.services.keys(),
      ...this.factories.keys(),
      ...this.singletons.keys()
    ]);
    return Array.from(allKeys);
  }

  public async initializeAll(): Promise<void> {
    const errors: Error[] = [];
    
    for (const [name, service] of this.singletons) {
      if (service && typeof service.initialize === 'function') {
        try {
          await service.initialize();
        } catch (error) {
          errors.push(new Error(`Failed to initialize service ${name}: ${(error as Error).message}`));
        }
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Failed to initialize services: ${errors.map(e => e.message).join(', ')}`);
    }
  }

  public async destroyAll(): Promise<void> {
    const errors: Error[] = [];
    
    for (const [name, service] of this.singletons) {
      if (service && typeof service.destroy === 'function') {
        try {
          await service.destroy();
        } catch (error) {
          errors.push(new Error(`Failed to destroy service ${name}: ${(error as Error).message}`));
        }
      }
    }
    
    if (errors.length > 0) {
      console.warn(`Failed to destroy some services: ${errors.map(e => e.message).join(', ')}`);
    }
  }

  public getServiceInfo(): Array<{ name: string; type: 'service' | 'factory' | 'singleton'; initialized: boolean }> {
    const info: Array<{ name: string; type: 'service' | 'factory' | 'singleton'; initialized: boolean }> = [];
    
    for (const name of this.services.keys()) {
      info.push({
        name,
        type: 'service',
        initialized: this.singletons.has(name)
      });
    }
    
    for (const name of this.factories.keys()) {
      info.push({
        name,
        type: 'factory',
        initialized: this.singletons.has(name)
      });
    }
    
    for (const name of this.singletons.keys()) {
      if (!this.services.has(name) && !this.factories.has(name)) {
        info.push({
          name,
          type: 'singleton',
          initialized: true
        });
      }
    }
    
    return info;
  }
}

// Global service container instance
export const serviceContainer = new ServiceContainer();

// Service decorator for automatic registration
export function Service(name: string, singleton: boolean = true) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    if (singleton) {
      serviceContainer.registerFactory(name, () => new constructor());
    } else {
      serviceContainer.register(name, constructor);
    }
    return constructor;
  };
}

// Inject decorator for dependency injection
export function Inject(serviceName: string) {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
    const existingTokens = Reflect.getMetadata('design:paramtypes', target) || [];
    existingTokens[parameterIndex] = serviceName;
    Reflect.defineMetadata('design:paramtypes', existingTokens, target);
  };
}

// Service provider interface
export interface IServiceProvider {
  provide(serviceName: string): any;
  register(serviceName: string, service: any): void;
  unregister(serviceName: string): void;
}

// Service provider implementation
export class ServiceProvider implements IServiceProvider {
  constructor(private container: IServiceContainer) {}

  public provide(serviceName: string): any {
    return this.container.get(serviceName);
  }

  public register(serviceName: string, service: any): void {
    this.container.register(serviceName, service);
  }

  public unregister(serviceName: string): void {
    this.container.remove(serviceName);
  }
}

// Service locator pattern
export class ServiceLocator {
  private static container: IServiceContainer = serviceContainer;

  public static setContainer(container: IServiceContainer): void {
    ServiceLocator.container = container;
  }

  public static get<T>(name: string): T {
    return ServiceLocator.container.get<T>(name);
  }

  public static has(name: string): boolean {
    return ServiceLocator.container.has(name);
  }

  public static register<T>(name: string, service: T): void {
    ServiceLocator.container.register(name, service);
  }

  public static registerFactory<T>(name: string, factory: () => T): void {
    ServiceLocator.container.registerFactory(name, factory);
  }
}
