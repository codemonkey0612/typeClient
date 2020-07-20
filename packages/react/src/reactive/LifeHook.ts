import { useApplicationContext, useContextState } from ".";
import { useEffect } from "react";
import { Context } from "@typeclient/core";

export function useContextEffect(callback: () => (() => void) | void) {
  const ctx = useApplicationContext();
  // const { status } = useContextState(() => {
  //   return {
  //     status: ctx.status.value,
  //   }
  // })
  useEffect(() => {
    switch (ctx.status.value) {
      case 200:
        const unMount = callback();
        if (typeof unMount === 'function') {
          ctx.$e.emit('context.destroy', unMount);
        }
        break;
      case 100:
        ctx.useEffect(callback);
        break;
    }
  }, []);
}