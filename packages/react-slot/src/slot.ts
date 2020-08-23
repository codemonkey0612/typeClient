import { createContext, PropsWithChildren, useState, ReactNode, createElement } from 'react';
import { SlotProvider } from './provider';
import { SlotConsumer } from './consumer';

type TSlotSubscribeStore = {
  name: string,
  children: ReactNode,
}

interface TSlotContext {
  subscribe: (name: string, children: ReactNode) => void,
  getNode: (name: string) => ReactNode,
}

export const Context = createContext<TSlotContext>(null);

export function Slot(props: PropsWithChildren<{}>) {
  const [subscribers, setSubscribe] = useState<TSlotSubscribeStore[]>([]);

  const getNode = (name: string) => {
    const subscriber = subscribers.find(subscriber => subscriber.name === name);
    if (!subscriber) return null;
    return subscriber.children;
  }

  const subscribe = (name: string, children: ReactNode) => {
    setSubscribe(subscribers => subscribers.concat({ name, children }));
    return () => unsubscribe(name);
  }

  const unsubscribe = (name: string) => {
    return setSubscribe(subscribers => subscribers.filter(subscriber => subscriber.name !== name));
  }

  return createElement(Context.Provider, {
    value: {
      subscribe,
      getNode,
    }
  }, props.children);
}

Slot.Provider = SlotProvider;
Slot.Consumer = SlotConsumer;