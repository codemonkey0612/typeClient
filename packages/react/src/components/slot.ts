import React from 'react';
import { Application } from '@typeclient/core';

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
    const { subscribe } = React.useContext(app.ReactSlotContext);
    const name = props.name || 'default';
    React.useEffect(() => subscribe(name, props.children), []);
    return null;
  }
}

function createConsumer<T extends Application>(app: T): React.FunctionComponent<{ name: string }> {
  return props => {
    // @ts-ignore
    const { getNode } = React.useContext(app.ReactSlotContext);
    const children = getNode(props.name);
    return (children || props.children || null) as React.ReactElement;
  }
}