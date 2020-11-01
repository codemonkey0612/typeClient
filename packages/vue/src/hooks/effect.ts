import { nextTick, onMounted, ref, watchEffect } from "vue";
import { TReactiveContext, useApplicationContext } from "../context";

export function useContextEffect<T extends TReactiveContext = TReactiveContext>(callback: () => (() => void) | void, ctx?: T) {
  const context = ctx || useApplicationContext<T>();
  const mounted = ref(false);
  const setted = ref(false);
  onMounted(() => mounted.value = true);
  watchEffect(() => {
    if (mounted.value && context.status && !setted.value) {
      setted.value = true;
      switch(context.status) {
        case 200: 
          const unMount = callback();
          if (typeof unMount === 'function') {
            context.value.$e.on('context.destroy', unMount);
          }
          break;
        case 100: return context.value.useEffect(callback);
      }
    }
  });
}