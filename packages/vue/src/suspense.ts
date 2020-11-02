import { defineComponent, h } from "vue";
import { useApplicationContext } from "./context";

export const Suspense = defineComponent({
  name: 'ContextSuspense',
  setup(props, context) {
    const ctx = useApplicationContext();
    return () => {
      if (ctx.status === 100) {
        return context.slots.loading ? h(context.slots.loading) : null;
      } else if (ctx.status === 200) {
        return context.slots.default ? h(context.slots.default) : null;
      }
    }
  }
})