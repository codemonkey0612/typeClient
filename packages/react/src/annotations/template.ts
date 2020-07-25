import React from 'react';
import { ClassMetaCreator, TClassIndefiner, useInject, TypeClientContainer, AnnotationDependenciesAutoRegister } from '@typeclient/core';
import { NAMESPACE } from './namespace';
import { ComponentTransform } from './component';
export function Template<T extends React.FunctionComponent | React.ComponentClass | TClassIndefiner<ComponentTransform>>(component: T): ClassDecorator {
  console.log((component as any).__isTypedComponent__)
  return target => {
    if ('__isTypedComponent__' in (component as any)) {
      AnnotationDependenciesAutoRegister(component as TClassIndefiner<ComponentTransform>, TypeClientContainer);
      const t = TypeClientContainer.get(component);
      const _component = t.render as React.FunctionComponent;
      return ClassMetaCreator.define(NAMESPACE.TEMPLATE, _component)(target);
    }
    return ClassMetaCreator.define(NAMESPACE.TEMPLATE, component)(target);
  }
}