import { PropsWithChildren, useContext, useEffect } from 'react';
import { Context } from './slot';

export function SlotProvider(props: PropsWithChildren<{ name?: string }>): null {
  const { subscribe } = useContext(Context);
  const name = props.name || 'default';
  useEffect(() => subscribe(name, props.children), []);
  return null;
}