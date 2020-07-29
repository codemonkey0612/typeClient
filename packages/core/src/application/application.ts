import { join } from 'path';
import { useHistoryFeedback, redirect, replace, reload } from '../history';
import { TClassIndefiner, AnnotationMetaDataScan, NAMESPACE, AnnotationDependenciesAutoRegister } from '../annotation';
import { TypeClientContainer } from '../ioc';
import { Router, RouterArguments } from '../router';
import { Context } from './context';
import { createNextTick } from '../history/next-tick';
import { ContextEventEmitter } from './events';
import { TApplicationLifeCycle } from './lifecycle';
import { ContextTransforming as transforming } from './transform';
import { Request } from './request';

type TNotFound = TApplicationLifeCycle['Application.onNotFound'];
type TError = TApplicationLifeCycle['Application.onError'];
type THashAnchor = TApplicationLifeCycle['Application.onHashAnchorChange'];
export type TApplicationOptions = RouterArguments & { prefix: string };

export class Application<S extends { 
  [key: string]: { 
    arguments: any[], 
    return: any 
  } 
} = {}> extends ContextEventEmitter<TApplicationLifeCycle & S> {
  private _initialized = false;
  private _subscribed = false;
  private _unSubscribe: ReturnType<typeof useHistoryFeedback>;

  public context: Context;
  public readonly prefix: string;
  private readonly router: Router;

  // history reload action
  public readonly reload = reload;
  public readonly nextTick = createNextTick((e: Error, ctx: Context) => {
    this.trigger(
      'Application.onErrorRender', 
      this.trigger('Application.onError', e, ctx)
    )
  });

  constructor(options: TApplicationOptions = { prefix: '/' }) {
    super();
    this.prefix = options.prefix || '/';
    this.router = new Router(options);
    this.subscribe();
  }

  /**
   * subscribe the history change evnets pool.
   * the browser history will been connected once it subscribed.
   * 
   * ```ts
   *  app.subscribe();
   * ```
   */
  public subscribe() {
    if (this._subscribed) return this;
    this._unSubscribe = useHistoryFeedback(url => {
      if (this._initialized) return this.createContext(url);
      return this.trigger('Application.onInit', () => {
        this._initialized = true;
        this.createContext(url);
      });
    });
    this._subscribed = true;
    return this;
  }

  /**
   * unSubscribe the history change events pool.
   * the browser history will been disconnected  once it unsubscribed.
   * 
   * ```ts
   *  app.unSubscribe();
   * ```
   */
  public unSubscribe() {
    if (!this._subscribed) return this;
    if (this._unSubscribe) {
      this._unSubscribe();
      this._subscribed = false;
    }
    return this;
  }

  /**
   * Lifecycle for `not found`
   * @param callback 
   * ```ts
   *  app.onNotFound((req: Request) => { ... });
   * ```
   */
  public onNotFound(callback: (...args: TNotFound['arguments']) => TNotFound['return']) {
    return this.on('Application.onNotFound', callback);
  }

  /**
   * Lifecycle for `error`
   * @param callback 
   * ```ts
   *  app.onError((err, ctx) => { ... });
   * ```
   */
  public onError(callback: (...args: TError['arguments']) => TError['return']) {
    return this.on('Application.onError', callback);
  }

  public onHashAnchor(callback: (...args: THashAnchor['arguments']) => THashAnchor['return']) {
    return this.on('Application.onHashAnchorChange', callback);
  }

  // create a new context for request.
  private createContext(url: string) {
    const uri = this.decode(url);
    if (uri) {
      const req = new Request(uri);
      const handler = this.router.lookup(req.pathname);
      
      // Not found.
      // You can deal with Application.onNotFound by return a value.
      if (!handler) return this.trigger(
        'Application.onErrorRender', 
        this.trigger('Application.onNotFound', req)
      );

      if (this.context) {
        // deal with old context
        // force it destory.
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

  /**
   * auto inject modules to <TypeContainer>.
   * @param classModules 
   */
  private injectClassModules(...classModules: TClassIndefiner<any>[]) {
    classModules.forEach(classModule => {
      AnnotationDependenciesAutoRegister(
        classModule, 
        TypeClientContainer
      )
    });
    return this;
  }

  /**
   * push new controller to Router and auto register its dependencies.
   * @param classModule 
   */
  public setController<T = any>(classModule: TClassIndefiner<T>) {
    const classMetadata = AnnotationMetaDataScan(classModule, TypeClientContainer);
    const classPrefix = classMetadata.meta.got(NAMESPACE.CONTROLLER, '/');
    const classInjectors = classMetadata.meta.got<TClassIndefiner<any>[]>(NAMESPACE.INJECTABLE, []);
    // auto register class injectors to container.
    this.injectClassModules(...classInjectors);
    for (const [key, method] of classMetadata.methods) {
      const propertyPaths = method.meta.got<string[]>(NAMESPACE.PATH, []);
      if (!propertyPaths.length) continue;
      const propertyInjectors = method.meta.got<TClassIndefiner<any>[]>(NAMESPACE.INJECTABLE, []);
      const propertyStates = method.meta.got<object | (() => object)>(NAMESPACE.STATE, {});
      // auto register method injectors to container.
      this.injectClassModules(...propertyInjectors);
      propertyPaths.forEach(propertyPath => {
        const propertyEntryPath = join(classPrefix, '.', propertyPath);
        this.router.on(propertyEntryPath, (req: Request) => {
          const server = TypeClientContainer.get<T>(classModule);
          const context = this.context = new Context(
            this, req, 
            /**
             * create new State value
             * if it is typeof function then it is not cacheable.
             * otherwise it is cacheable.
             */
            typeof propertyStates === 'function' 
              ? propertyStates() 
              : propertyStates
          );
          // use async middleware process to change states.
          transforming(context, method);
          // use render hooks
          this.trigger('Application.onRender', context, server, key, method);
        })
      });
    }
  }

  /**
   * wrap url with prefix
   * @param url 
   */
  private urlencode(url: string) {
    if (url.startsWith(this.prefix)) return url;
    return join(this.prefix, '.', url);
  }

  /**
   * history redirect action
   * @param url 
   * @param title 
   */
  public redirect(url: string, title?: string) {
    return redirect(this.urlencode(url), title);
  }

  /**
   * history replace action
   * @param url 
   * @param title 
   */
  public replace(url: string, title?: string) {
    return replace(this.urlencode(url), title);
  }
}