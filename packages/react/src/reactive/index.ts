import React, { useContext } from 'react';
import { useForceUpdate, useEffection } from './effect';
import { Context } from '@typeclient/core';

type Selector<T, S> = (store: T) => S;

const StoreContext = React.createContext<any>(null);

const useStoreContext = () => {
  const contextValue = useContext(StoreContext);
  if (!contextValue) {
    throw new Error(
      'could not find store context value; please ensure the component is wrapped in a <Provider>',
    );
  }
  return contextValue;
};

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

/**
 * 在组件中读取全局状态
 * 需要通过传入的函数收集依赖
 */
export const useContextState = <T, S>(selector: Selector<T, S>): S => {
  const store = useStoreContext() as T;
  return useReactiveState<S>(() => selector(store));
};

export const ContextProvider = StoreContext.Provider;
export function useApplicationContext<T extends Context>() {
  return useStoreContext() as T;
}
export * from './LifeHook';