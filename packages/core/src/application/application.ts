import { join } from 'path';
import { useHistoryFeedback, redirect, replace, reload } from '../history';
import { TClassIndefiner, AnnotationMetaDataScan, NAMESPACE, AnnotationDependenciesAutoRegister, TAnnotationScanerMethod } from '../annotation';
import { TypeClientContainer } from '../ioc';
import { Router, RouterArguments } from '../router';
import { Context } from './context';
import { createNextTick } from '../history/next-tick';
import { ContextEventEmitter } from './events';
import { TApplicationLifeCycle } from './lifecycle';
import { ContextTransforming } from './transform';
import { Request } from './request';

export type TApplicationOptions = RouterArguments & { prefix: string };

export class Application<S extends { [key: string]: { arguments: any[], return: any } }> extends ContextEventEmitter<TApplicationLifeCycle & S> {
  private initialized = false;
  public readonly prefix: string;
  private readonly router: Router;
  
  public context: Context;
  public readonly reload = reload;
  public readonly unSubscribe: ReturnType<typeof useHistoryFeedback>;
  public readonly nextTick = createNextTick((e: Error, ctx: Context) => this.trigger('Application.onError', e, ctx));

  constructor(options: TApplicationOptions = { prefix: '/' }) {
    super();
    this.prefix = options.prefix || '/';
    this.router = new Router(options);
    this.unSubscribe = useHistoryFeedback(url => {
      if (this.initialized) return this.createContext(url);
      return this.trigger('Application.onInit', () => {
        this.initialized = true;
        this.createContext(url);
      });
    });
  }

  private createContext(url: string) {
    const uri = this.decode(url);
    if (uri) {
      const req = new Request(uri);
      const handler = this.router.lookup(req.pathname);
      if (!handler) return this.trigger('Application.onErrorRender', this.trigger('Application.onNotFound', req));
      if (this.context) {
        switch (this.context.status.value) {
          case 100: this.context.destroy(); break;
          case 200: this.context.$e.emit('context.destroy'); break;
        }
      }
      req.params = handler.params || {};
      this.nextTick(req, handler.handler);
    }
  }

  // If the route matches the prefix,
  // then clear the prefix to get the real routing address.
  private decode(path: string) {
    if (path.startsWith(this.prefix)) {
      return path.substring(this.prefix.length - 1) || '/';
    }
  }

  private injectClassModules(...classModules: TClassIndefiner<any>[]) {
    classModules.forEach(classModule => {
      AnnotationDependenciesAutoRegister(
        classModule, 
        TypeClientContainer
      )
    });
    return this;
  }

  public setController<T = any>(classModule: TClassIndefiner<T>) {
    const classMetadata = AnnotationMetaDataScan(classModule, TypeClientContainer);
    const classPrefix = classMetadata.meta.got(NAMESPACE.CONTROLLER, '/');
    const classInjectors = classMetadata.meta.got<TClassIndefiner<any>[]>(NAMESPACE.INJECTABLE, []);
    this.injectClassModules(...classInjectors);
    for (const [key, method] of classMetadata.methods) {
      const propertyPaths = method.meta.got<string[]>(NAMESPACE.PATH, []);
      if (!propertyPaths.length) continue;
      const propertyInjectors = method.meta.got<TClassIndefiner<any>[]>(NAMESPACE.INJECTABLE, []);
      const propertyStates = method.meta.got<object | (() => object)>(NAMESPACE.STATE, {});
      this.injectClassModules(...propertyInjectors);
      propertyPaths.forEach(propertyPath => {
        const propertyEntryPath = join(classPrefix, '.', propertyPath);
        this.router.on(propertyEntryPath, (req: Request) => {
          const context = this.context = new Context(this, req, typeof propertyStates === 'function' ? propertyStates() : propertyStates);
          const server = TypeClientContainer.get<T>(classModule);
          this.trigger('Application.onRender', context, server, key, method);
          ContextTransforming(context, method)
        })
      });
    }
  }

  private urlencode(url: string) {
    if (url.startsWith(this.prefix)) return url;
    return join(this.prefix, '.', url);
  }

  public redirect(url: string, title?: string) {
    return redirect(this.urlencode(url), title);
  }

  public replace(url: string, title?: string) {
    return replace(this.urlencode(url), title);
  }
}