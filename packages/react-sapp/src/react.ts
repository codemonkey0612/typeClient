import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import { TReactPortalContext, CreateGlobalComponent } from './component';
import { ContextProvider, useReactiveState } from './reactive';
import { ComponentTransform, useComponent } from './annotations';
import { 
  State, 
  AnnotationMetaDataScan, 
  Application, 
  Context, 
  Controller, 
  inject, 
  NAMESPACE, 
  onContextCreated, 
  Route, 
  TClassIndefiner, 
  TypeClientContainer, 
  unSubscribe, 
  useException, 
  useMiddleware 
} from '@typeclient/core';

export class ReactApplication extends Application {
  public readonly FCS: WeakMap<any, Map<string, React.FunctionComponent<any>>> = new WeakMap();
  private portalDispatcher: React.Dispatch<React.SetStateAction<TReactPortalContext<any>>>;
  constructor(el: HTMLElement) {
    super({ prefix: '/' });
    unSubscribe();
    this.on('Application.onInit', next => this.applicationWillSetup(el, next));
    this.on('Application.onRender', (ctx, server, key) => this.applicationRendering(ctx, server, key));
    this.on('Application.onErrorRender', (node: any) => {
      if (this.portalDispatcher) {
        this.portalDispatcher({
          context: null,
          component: () => node,
        })
      }
    });
    this.installContextTask();
    this.onNotFound(() => null);
  }

  private installContextTask() {
    let cmp: FunctionComponent = null;
    let state: any = null;
    this.setBeforeContextCreate(props => {
      const fn = this.getLazyServerKeyCallback(props.server, props.key as string);
      const _state = typeof props.state === 'function' ? props.state() : props.state;
      if (cmp && fn === cmp) {
        state = Object.assign(state, _state);
        return props.next(state);
      }
      state = _state;
      cmp = fn;
      props.next(state);
    });
  }

  public setPortalReceiver<T extends Context = Context>(fn: React.Dispatch<React.SetStateAction<TReactPortalContext<T>>>) {
    if (!this.portalDispatcher) this.portalDispatcher = fn;
    return this;
  } 

  private applicationWillSetup(el: HTMLElement, next: Function) {
    const GlobalComponent = CreateGlobalComponent(this);
    ReactDOM.render(React.createElement(GlobalComponent), el);
    next();
  }

  private applicationRendering(ctx: Context, server: any, key: string) {
    const LazyComponent = this.getLazyServerKeyCallback(server, key);

    if (this.portalDispatcher) {
      this.portalDispatcher({
        context: ctx,
        component: LazyComponent,
      })
    }
  }

  private getLazyServerKeyCallback(server: any, key: string): React.FunctionComponent<any> {
    const constructor = server.constructor;
    if (!this.FCS.has(constructor)) this.FCS.set(constructor, new Map());
    const fcs = this.FCS.get(constructor);
    if (!fcs.has(key)) {
      const Component = server[key].bind(server);
      const Checker = (ctx: Context) => {
        const { status, error } = useReactiveState(() => ({ 
          status: ctx.status.value,
          error: ctx.error.value,
        }));
 
        return status === 500 
          ? error || null
          : React.createElement(Component, ctx);
      }
      const CMP = (ctx: Context) => React.createElement(
        ContextProvider, { value: ctx }, 
        React.createElement(Checker, ctx)
      )
      fcs.set(key, CMP);
    }
    return fcs.get(key);
  }

  public render<T extends ComponentTransform>(component: TClassIndefiner<T>) {
    const classMetadata = AnnotationMetaDataScan(component, TypeClientContainer);
    const classInjectors = classMetadata.meta.got<TClassIndefiner<any>[]>(NAMESPACE.INJECTABLE, []);
    const States = classMetadata.meta.got<object | (() => object)>(NAMESPACE.STATE, {});
    const Middlewares = classMetadata.meta.got(NAMESPACE.MIDDLEWARE, []);
    const Created = classMetadata.meta.got(NAMESPACE.CONTEXTCREATED, []);
    const Exception = classMetadata.meta.got(NAMESPACE.EXCEPTION, null);
    this.injectClassModules(...classInjectors);
    @Controller()
    class main {
      @inject(component) private readonly component: T;
      @Route()
      // @ts-ignore
      @State(States)
      @useMiddleware(...Middlewares)
      @useException(Exception)
      // @ts-ignore
      @onContextCreated(...Created)
      Page<T extends Context>(props: T) {
        const Component = useComponent(this.component) as React.FunctionComponent<T>;
        return React.createElement(Component, props, null);
      }
    }
    this.setController(main);
    return this;
  }
}