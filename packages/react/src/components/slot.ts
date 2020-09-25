import React, { Fragment, useEffect } from 'react';
import { Application } from '@typeclient/core';
import { useReactiveState } from '../reactive';

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
    const store = React.useContext<TSlotContext>(app.slotContext);
    useEffect(() => {
      if (!store[props.name]) {
        store[props.name] = [];
      }
      if (store[props.name].indexOf(props.children) === -1) {
        store[props.name].push(props.children);
      }
      return () => {
        const index = store[props.name].indexOf(props.children);
        if (index > -1) {
          store[props.name].splice(index, 1);
        }
        if (store[props.name].length === 0) {
          delete store[props.name];
        }
      }
    }, [props.name, props.children]);
    return null;
  }
}

function createConsumer<T extends Application>(app: T): React.FunctionComponent<{ name: string }> {
  return props => {
    // @ts-ignore
    const store = React.useContext<TSlotContext>(app.slotContext);
    const value = useReactiveState(() => store[props.name]);
    if (!value) return null;
    return React.createElement(Fragment, null, ...value);
  }
}