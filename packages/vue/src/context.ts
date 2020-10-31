import { Context } from "@typeclient/core";
import { DefineComponent, defineComponent, h, inject, provide, ref, Ref } from "vue";

type TContextMessager<T = any> = {
  Provider: DefineComponent<{ value: T }>,
  Consumer: DefineComponent,
}

const contextMap: WeakMap<TContextMessager, symbol> = new WeakMap();

export function createContext<T = any>(defaultValue: T = null) {
  const key = Symbol('app');
  const messager: TContextMessager<T> = { Provider: null, Consumer: null };

  // @ts-ignore
  messager.Provider = defineComponent({
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
        _ref.value = props.value;
        return h(context.slots.default)
      };
    }
  });

  // @ts-ignore
  messager.Consumer = defineComponent((props, context) => {
    return () => h(context.slots.default(useContext<T>(messager)));
  });

  contextMap.set(messager, key);

  return messager;
}

export function useContext<T = any>(target: TContextMessager<T>) {
  const key = contextMap.get(target);
  if (key) return inject<Ref<T>>(key).value;
}

export const _ApplicationContext = createContext();
export function useApplicationContext<T extends Context = Context>() {
  return useContext<T>(_ApplicationContext)
}