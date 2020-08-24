import React from 'react';
import { ReactApplication } from "../react";

const ProviderDictionary = new WeakMap<ReactApplication, React.FunctionComponent<{ name: string }>>();
const ConsumerDictionary = new WeakMap<ReactApplication, React.FunctionComponent<{ name: string }>>();

export function useSlot(app: ReactApplication) {
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

function createProvider(app: ReactApplication): React.FunctionComponent<{ name: string }> {
  return (props): null => {
    const { subscribe } = React.useContext(app.ReactSlotContext);
    const name = props.name || 'default';
    React.useEffect(() => subscribe(name, props.children), []);
    return null;
  }
}

function createConsumer(app: ReactApplication): React.FunctionComponent<{ name: string }> {
  return props => {
    const context = React.useContext(app.ReactSlotContext);
    const children = context.getNode(props.name);
    return (children || props.children || null) as React.ReactElement;
  }
}