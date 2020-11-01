import { Application, Context, Request } from "@typeclient/core";
import { DefineComponent, defineComponent, h, inject, provide, ref, Ref, UnwrapRef, reactive } from "vue";

type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRef<T>;
type TContextMessager<T = any> = {
  Provider: DefineComponent<{ value: T }>,
  Consumer: DefineComponent,
}

export interface TReactiveContext<T extends object = {}> {
  readonly req: Context<T>['req'],
  readonly app: Context<T>['app'],
  readonly state: Context<T>['state'],
  readonly query: Context<T>['req']['query'],
  readonly params: Context<T>['req']['params'],
  readonly error: any,
  readonly status: number,
  value: Context<T>,
}

export type TReactiveContextProps = { ctx: TReactiveContext };

export const ReactiveContext = {
  req: Request,
  app: Application,
  state: Object,
  query: Object,
  params: Object,
  error: {
    required: false,
  },
  status: Number,
  value: Context,
}

const contextMap: WeakMap<TContextMessager, symbol> = new WeakMap();

export function createContext<T = any>(defaultValue: T = null) {
  const key = Symbol();
  const messager: TContextMessager<T> = { Provider: null, Consumer: null };

  // @ts-ignore
  messager.Provider = defineComponent({
    name: 'ContextProvider',
    props: {
      value: {
        required: true,
      }
    },
    setup(props, context) {
      const _ref = ref(defaultValue);
      provide(key, _ref);
      return () => {
        // @ts-ignore
        props.value && (_ref.value = props.value);
        return context.slots.default 
          ? h(context.slots.default) 
          : null;
      };
    }
  });

  // @ts-ignore
  messager.Consumer = defineComponent({
    name: 'ContextConsumer',
    setup(props, context) {
      return () => context.slots.default 
        ? h(context.slots.default(useContext<T>(messager))) 
        : null;
    }
  });

  contextMap.set(messager, key);

  return messager;
}

export function useContext<T = any>(target: TContextMessager<T>) {
  const key = contextMap.get(target);
  if (key) return inject<Ref<T>>(key).value;
}

export const _ApplicationContext = createContext();
export function useApplicationContext<T extends object = {}>() {
  return useContext<TReactiveContext<T>>(_ApplicationContext)
}

export function createReactiveContext() {
  return reactive<UnwrapNestedRefs<TReactiveContext>>({
    value: null,
    get status() { return this.value?.status; },
    get error() { return this.value?.error; },
    get state() { return this.value?.state; },
    get req() { return this.value?.req; },
    get query() { return this.req?.query; },
    get params() { return this.req?.params; },
    get app() { return this.value?.app; },
  });
}