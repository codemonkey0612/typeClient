import { Application, Context, TAnnotationScanerMethod, TApplicationOptions } from '@typeclient/core';
import { createApp, defineComponent, onMounted, h, DefineComponent, shallowRef, Ref } from 'vue';
import { NAMESPACE } from './annotations';
import { useApplicationContext, _ApplicationContext, createReactiveContext, TReactiveContextProps, ReactiveContext } from './context';

export interface TVueApplicationOptions extends TApplicationOptions {
  el: HTMLElement | string
}

export class VueApplication extends Application {
  public readonly FCS: WeakMap<any, Map<string, DefineComponent<any, any, any>>> = new WeakMap();
  private _context$ = createReactiveContext();
  private _template$: Ref<DefineComponent> = shallowRef(null);
  private _slot$: Ref<DefineComponent> = shallowRef(null);

  constructor(options: TVueApplicationOptions) {
    super(options);
    this.on('Application.onInit', next => this.setup(options.el, next));
    this.on('Application.onRender', (ctx, server, key, metadata) => this.render(ctx, server, key, metadata));
    this.on('Application.onErrorRender', (node: any) => {
      this._slot$.value = node;
      this._template$.value = null;
    });
    this.installContextTask();
  }

  private installContextTask() {
    let cmp: DefineComponent = null;
    let state: any = null;
    this.setBeforeContextCreate(props => {
      const fn = this.getSlot(props.server, props.key as string);
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

  private setup(el: TVueApplicationOptions['el'], next: () => void) {
    createApp(defineComponent({
      name: 'Root',
      setup: () => {
        onMounted(next);
        return () => {
          const ctx = this._context$;
          const template = this._template$.value;
          const slot = this._slot$.value;
          const wrapSlot = !ctx 
            ? null 
            : h(_ApplicationContext.Provider, { value: ctx }, {
                default: () => [
                  h(slot)
                ]
              });

          if (template) return h(template, { ctx }, !wrapSlot ? null : {
            default: () => [h(wrapSlot)]
          });

          return wrapSlot ? h(wrapSlot) : null;
        };
      }
    })).mount(el);
  }

  private render<T extends Context = Context>(ctx: T, server: any, key: string, metadata: TAnnotationScanerMethod) {
    const classModuleMetaData = metadata.meta.parent;
    const TemplateComponent = classModuleMetaData.got<any>(NAMESPACE.TEMPLATE, null);
    const SlotComponent = this.getSlot(server, key);

    // @ts-ignore
    this._context$.value = ctx;
    this._slot$.value = SlotComponent || null;
    this._template$.value = TemplateComponent || null;
  }

  private getSlot(server: any, key: string) {
    const constructor = server.constructor;
    if (!this.FCS.has(constructor)) this.FCS.set(constructor, new Map());
    const fcs = this.FCS.get(constructor);
    if (!fcs.has(key)) {
      const name = constructor.name || 'UntitledClass';
      const Wrapper = defineComponent({
        name: name + 'Wrapper',
        setup: () => {
          const ctx = useApplicationContext();
          return () => {
            if (ctx.status === 500) return ctx.error ? h(ctx.error) : null;
            return h(defineComponent({
              name: name + 'Route' + key,
              setup(props, context) { return server[key](context); },
            }));
          }
        }
      });
      fcs.set(key, Wrapper);
    }
    return fcs.get(key);
  }
}