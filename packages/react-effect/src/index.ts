import { useMemo } from 'react';
import { useForceUpdate, useEffection } from './effect';

export const useReactiveState = <S>(selector: () => S): S => {
  const forceUpdate = useForceUpdate();
  const effection = useEffection(selector, {
    scheduler: job => {
      if (job() === undefined) return;
      forceUpdate();
    },
    lazy: true,
  });
  return effection();
}

export function useReactiveMemoState<S>(feedback: () => S, deps: React.DependencyList): S {
  return useMemo(() => useReactiveState(feedback), deps);
}