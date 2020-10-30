import { useApplicationContext } from ".";
import { useEffect } from "react";
import { Context } from "@typeclient/core";
 
export function useContextEffect<T extends Context = Context>(callback: () => (() => void) | void, ctx?: T) {
  const context = ctx || useApplicationContext();
  useEffect(() => {
    switch (context.status.value) {
      case 200:
        const unMount = callback();
        if (typeof unMount === 'function') {
          context.$e.on('context.destroy', unMount);
        }
        break;
      case 100: return context.useEffect(callback);
    }
  }, []);
}