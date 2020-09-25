import React, { useEffect } from 'react';
import { Application } from '@typeclient/core';
import { useReactiveState } from '../reactive';
import { ReactApplication } from '../react';

const ProviderDictionary = new WeakMap<Application, React.FunctionComponent<{ name: string }>>();
const ConsumerDictionary = new WeakMap<Application, React.FunctionComponent<{ name: string }>>();

export function useSlot<T extends Application>(app: T) {
  if (!ProviderDictionary.has(app)) {
    ProviderDictionary.set(app, createProvider(app));
  }
  if (!ConsumerDictionary.has(app)) {
    ConsumerDictionary.set(app, createConsumer(app));
  }
  return {
    Provider: ProviderDictionary.get(app),
    Consumer: ConsumerDictionary.get(app),
  }
}

function createProvider<T extends Application>(app: T): React.FunctionComponent<{ name: string }> {
  return (props): null => {
    // @ts-ignore
    const store = React.useContext<ReactApplication['slotState']>(app.slotContext);
    useEffect(() => {
      store[props.name] = props.children || null;
      return () => delete store[props.name];
    }, [props.name, props.children]);
    return null;
  }
}

function createConsumer<T extends Application>(app: T): React.FunctionComponent<{ name: string }> {
  return props => {
    // @ts-ignore
    const store = React.useContext<ReactApplication['slotState']>(app.slotContext);
    const value = useReactiveState(() => store[props.name] || null);
    return (value || props.children || null) as React.ReactElement;
  }
}