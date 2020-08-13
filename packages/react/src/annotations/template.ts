import React from 'react';
import { ClassMetaCreator, TClassIndefiner, TypeClientContainer, AnnotationDependenciesAutoRegister } from '@typeclient/core';
import { NAMESPACE } from './namespace';
import { ComponentTransform, useComponent } from './component';
export function Template<M extends ComponentTransform, T extends React.FunctionComponent<any> | React.ComponentClass<any> | TClassIndefiner<M>>(component: T): ClassDecorator {
  return target => {
    if (component.prototype && typeof component.prototype.render === 'function' && component.prototype.render.length <= 1) {
      const meta = ClassMetaCreator.instance(component);
      const isIocComponent = meta.got(NAMESPACE.COMPONENT, false);
      if (isIocComponent) {
        AnnotationDependenciesAutoRegister(component as TClassIndefiner<M>, TypeClientContainer);
        const typedComponent = TypeClientContainer.get<M>(component);
        const _component = useComponent(typedComponent);
        return ClassMetaCreator.define(NAMESPACE.TEMPLATE, _component)(target);
      }
    } else if (typeof component === 'function' && component.length <= 1) {
      ClassMetaCreator.define(NAMESPACE.TEMPLATE, component)(target);
    }
  }
}