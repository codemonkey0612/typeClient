import React from 'react';
import { ClassMetaCreator, TClassIndefiner, useInject, TypeClientContainer, AnnotationDependenciesAutoRegister } from '@typeclient/core';
import { NAMESPACE } from './namespace';
import { ComponentTransform } from './component';
export function Template<T extends React.FunctionComponent<any> | React.ComponentClass<any> | TClassIndefiner<ComponentTransform>>(component: T): ClassDecorator {
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