import { useApplicationContext } from ".";
import { useReactiveMemoState } from '@typeclient/react-effect';
import React, { useEffect } from "react";
import { Context } from "@typeclient/core";

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

export function useContextMemoState<T extends Context, S>(feedback: (ctx: T) => S, deps: React.DependencyList): S {
  const ctx = useApplicationContext() as T;
  return useReactiveMemoState(() => feedback(ctx), deps);
}

export function useContextSideEffect(callback: () => void) {
  const ctx = useApplicationContext();
  useEffect(() => ctx.useSideEffect(callback, true), []);
}