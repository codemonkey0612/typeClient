import { Application, Context, TAnnotationScanerMethod, TApplicationOptions } from '@typeclient/core';
import { createApp, defineComponent, onMounted, h, reactive, DefineComponent } from 'vue';
import { NAMESPACE } from './annotations';
import { useApplicationContext, _ApplicationContext } from './context';

type TVueRootData<T extends Context = Context> = {
  context: T,
  template: any,
  slot: DefineComponent<T>
}

export interface TVueApplicationOptions extends TApplicationOptions {
  el: HTMLElement | string
}

export class VueApplication extends Application {
  public readonly FCS: WeakMap<any, Map<string, any>> = new WeakMap();
  public readonly state = reactive<TVueRootData>({
    context: null,
    template: null,
    slot: null,
  });

  constructor(options: TVueApplicationOptions) {
    super(options);
    this.on('Application.onInit', next => this.setup(options.el, next));
    this.on('Application.onRender', (ctx, server, key, metadata) => this.render(ctx, server, key, metadata));
    this.on('Application.onErrorRender', (node: any) => {
      this.state.context = null;
      this.state.slot = node;
      this.state.template = null;
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
    createApp(defineComponent(() => {
      onMounted(next);
      return () => {
        const children = !this.state.context ? null : this.state.template
          // @ts-ignore
          ? h(this.state.template, null, h(this.state.slot))
          // @ts-ignore
          : h(this.state.slot);
        return h(_ApplicationContext.Provider, { value: this.state.context }, children);
      };
    })).mount(el);
  }

  private render(ctx: Context, server: any, key: string, metadata: TAnnotationScanerMethod) {
    const classModuleMetaData = metadata.meta.parent;
    const TemplateComponent = classModuleMetaData.got<any>(NAMESPACE.TEMPLATE, null);
    const SlotComponent = this.getSlot(server, key);

    // @ts-ignore
    this.state.context = ctx || null;
    this.state.slot = SlotComponent || null;
    this.state.template = TemplateComponent || null;
  }

  private getSlot(server: any, key: string) {
    const constructor = server.constructor;
    if (!this.FCS.has(constructor)) this.FCS.set(constructor, new Map());
    const fcs = this.FCS.get(constructor);
    if (!fcs.has(key)) {
      const checker = defineComponent(() => {
        const ctx = useApplicationContext();
        const status = ctx.status;
        const error = ctx.error;
        return () => {
          if (status.value === 500) return error.value ? h(error.value) : null;
          return h(defineComponent(server[key].bind(server)));
        }
      });
      fcs.set(key, checker);
    }
    return fcs.get(key);
  }
}