import { useContext, ReactElement, FunctionComponent } from 'react';
import { Context } from './slot';

export const SlotConsumer: FunctionComponent<{ name?: string }> = (props) => {
  const name = props.name || 'default';
  const { getNode } = useContext(Context);
  const children = getNode(name);
  const child = children || props.children || null;
  return child as ReactElement;
}