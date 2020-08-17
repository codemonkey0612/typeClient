import { useApplicationContext } from ".";
import { useReactiveState } from '@typeclient/react-effect';
import React, { useEffect, useMemo } from "react";
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
      case 100:
        ctx.useEffect(callback);
        break;
    }
  }, []);
}

export function useReactiveMemoState<S>(feedback: () => S, deps: React.DependencyList): S {
  return useMemo(() => useReactiveState(feedback), deps);
}

export function useContextMemoState<T extends Context, S>(feedback: (ctx: T) => S, deps: React.DependencyList): S {
  const ctx = useApplicationContext() as T;
  return useReactiveMemoState(() => feedback(ctx), deps);
}