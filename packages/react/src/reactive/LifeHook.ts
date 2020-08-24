import { useApplicationContext } from ".";
import { useEffect } from "react";

export function useContextEffect(callback: () => (() => void) | void) {
  const ctx = useApplicationContext();
  useEffect(() => {
    switch (ctx.status.value) {
      case 200:
        const unMount = callback();
        if (typeof unMount === 'function') {
          ctx.$e.on('context.destroy', unMount);
        }
        break;
      case 100: return ctx.useEffect(callback);
    }
  }, []);
}