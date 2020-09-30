import { useForceUpdate, useEffection } from './effect';

export const useReactiveState = <S>(selector: () => S, changes?: any[]): S => {
  const forceUpdate = useForceUpdate();
  const effection = useEffection(selector, {
    scheduler: job => {
      if (job() === undefined) return;
      forceUpdate();
    },
    lazy: true,
  }, changes);
  return effection();
}