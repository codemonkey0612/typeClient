import { ClassMetaCreator } from "@typeclient/core";
import { injectable } from 'inversify';
import { defineComponent, DefineComponent, SetupContext, VNode } from "vue";
import { NAMESPACE } from './namespace';

const stacks = new WeakMap<object, DefineComponent>();

export function Component() {
  return ClassMetaCreator.join(
    (target: any) => {
      const fn = target.prototype.setup;
      if (!fn) throw new Error('component must be a render function in class object');
    },
    injectable(),
    ClassMetaCreator.define(NAMESPACE.COMPONENT, true)
  )
}

export declare class ComponentTransform<T = any> {
  public readonly name?: string;
  public readonly props?: T;
  public setup: (props: Readonly<T>, ctx: SetupContext) => () => VNode;
}

export function useComponent<T extends ComponentTransform>(component: T, Props?: unknown) {
  const constructor = component.constructor;
  const instance = ClassMetaCreator.instance(constructor);
  const isComponent = instance.got(NAMESPACE.COMPONENT, false);
  if (!isComponent) throw new Error('component is not an iocComponent');
  if (stacks.has(constructor)) return stacks.get(constructor);
  stacks.set(constructor, defineComponent({ 
    props: Props || component.props, 
    setup: component.setup.bind(component), 
    name: constructor.name || component.name 
  }));
  return stacks.get(constructor);
}