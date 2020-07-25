import React from 'react';
import { ClassMetaCreator } from "@typeclient/core";
import { injectable } from 'inversify';
const stacks = new WeakMap<any, Function>();
export function Component() {
  return ClassMetaCreator.join(
    injectable(),
    (target: any) => {
      const fn = target.prototype.render;
      if (!fn) throw new Error('component must be a render function in class object');
      
      Object.defineProperty(target.prototype, 'render', {
        get() {
          if (!stacks.has(target)) {
            stacks.set(target, fn.bind(this));
          }
          return stacks.get(target);
        }
      });

      Object.defineProperty(target, '__isTypedComponent__', {
        get: () => true,
      });
    }
  )
}

export declare class ComponentTransform {
  static readonly __isTypedComponent__: true;
  public render(props: React.Props<any>): React.ReactElement<any>;
}