import React, { useState } from 'react';
import { ReactApplication } from '../react';
import { Context } from '@typeclient/core';

export type TReactPortalContext<T extends Context = Context> = {
  template: React.FunctionComponent<T>,
  slot: React.FunctionComponent<T>,
  context: T
}

type TSlotSubscribeStore = {
  name: string,
  children: React.ReactNode,
}

export interface TSlotContext {
  subscribe: (name: string, children: React.ReactNode) => void,
  getNode: (name: string) => React.ReactNode,
}

export function CreateGlobalComponent(app: ReactApplication): React.FunctionComponent {
  app.ReactSlotContext = React.createContext<TSlotContext>(null);
  return () => {
    const [subscribers, setSubscribe] = useState<TSlotSubscribeStore[]>([]);
    const [{ template, slot, context }, setComponents] = useState<TReactPortalContext>({ template: null, slot: null, context: null });
    app.setPortalReceiver(setComponents);

    const getNode = (name: string) => {
      const subscriber = subscribers.find(subscriber => subscriber.name === name);
      if (!subscriber) return null;
      return subscriber.children;
    }

    const unsubscribe = (name: string) => {
      return setSubscribe(subscribers => subscribers.filter(subscriber => subscriber.name !== name));
    }
  
    const subscribe = (name: string, children: React.ReactNode) => {
      setSubscribe(subscribers => subscribers.concat({ name, children }));
      return () => unsubscribe(name);
    }

    const Template = template || DefaultTemplate;
    const Slot = slot || DefaultSlot;

    return React.createElement(app.ReactSlotContext.Provider, {
      value: {
        getNode,
        subscribe,
      }
    }, React.createElement(Template, context, React.createElement(Slot, context)));
  }
}

function DefaultTemplate(props: React.PropsWithChildren<any>) {
  return props.children;
}

function DefaultSlot<T extends Context = Context>(props: React.PropsWithChildren<T>): null {
  return null;
}