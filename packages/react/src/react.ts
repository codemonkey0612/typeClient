import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Application, TApplicationOptions, Context, TAnnotationScanerMethod } from '@typeclient/core';
import { TReactApplicationLifecycles } from './lifecycle';
import { CreateGlobalComponent } from './components/global';
import { NAMESPACE } from './annotations';
import { ContextProvider, useReactiveState } from './reactive';

export type TReactApplicationOptions = TApplicationOptions & { el: HTMLElement };

export class ReactApplication extends Application<TReactApplicationLifecycles> {
  public readonly FCS: WeakMap<any, Map<string, React.FunctionComponent<any>>> = new WeakMap();
  constructor(options: TReactApplicationOptions) {
    super(options);
    this.on('Application.onInit', next => this.applicationWillSetup(options.el, next));
    this.on('Application.onRender', (ctx, server, key, metadata) => this.applicationRendering(ctx, server, key, metadata));
    this.on('Application.redirection', () => this.trigger('React.component', () => null));
    this.on('Application.onErrorRender', (node: any) => {
      this.trigger('React.props', null);
      this.trigger('React.component', () => () => node);
    });
  }

  private applicationWillSetup(el: HTMLElement, next: () => void) {
    const GlobalComponent = CreateGlobalComponent(this);
    ReactDOM.render(React.createElement(GlobalComponent), el);
    next();
  }

  private applicationRendering(ctx: Context, server: any, key: string, metadata: TAnnotationScanerMethod) {
    const classModuleMetaData = metadata.meta.parent;
    const TemplateComponent = classModuleMetaData.got<React.FunctionComponent>(NAMESPACE.TEMPLATE, null);
    const LazyComponent = this.getLazyServerKeyCallback(server, key);
    this.trigger('React.props', ctx);
    if (TemplateComponent) {
      this.trigger('React.component', () => TemplateComponent);
      this.trigger('React.slot', () => LazyComponent);
    } else {
      this.trigger('React.component', () => LazyComponent);
      // this.trigger('React.slot', () => null);
    }
  }

  private getLazyServerKeyCallback(server: any, key: string): React.FunctionComponent<any> {
    if (!this.FCS.has(server)) this.FCS.set(server, new Map());
    const fcs = this.FCS.get(server);
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

  public createSlotter(): React.FunctionComponent {
    return props => {
      const [Component, setComponent] = useState<React.FunctionComponent<any>>(null);
      this.on('React.slot', setComponent);
      return Component 
        ? React.createElement(Component, props) 
        : null;
    }
  }
}