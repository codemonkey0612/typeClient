import { useRef } from 'react';
import nextTick from 'next-tick';
import { useForceUpdate, useEffection } from './effect';

export const useReactiveState = <S>(selector: () => S, changes?: any[]): S => {
  const forceUpdate = useForceUpdate();
  const j = useRef<() => S>(null);
  const r = useRef(false);
  const notify = (fn: () => void) => {
    const job = j.current;
    j.current = null;
    if (job) {
      const value = job();
      if (value === undefined) return fn();
      forceUpdate();
    }
    return fn();
  }
  const effection = useEffection(selector, {
    scheduler: job => {
      j.current = job;
      if (!r.current) {
        r.current = true;
        nextTick(() => notify(() => r.current = false));
      }
    },
    lazy: true,
  }, changes);
  return effection();
}