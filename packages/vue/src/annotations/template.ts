import { ClassMetaCreator, TClassIndefiner, TypeClientContainer, AnnotationDependenciesAutoRegister } from '@typeclient/core';
import { NAMESPACE } from './namespace';
import { ComponentTransform, useComponent } from './component';
import { Component } from 'vue';
export function Template<M extends ComponentTransform, T extends Component>(component: M | T): ClassDecorator {
  return target => {
    // @ts-ignore
    if (component.prototype && typeof component.prototype.setup === 'function' && component.prototype.setup.length <= 2) {
      const meta = ClassMetaCreator.instance(component);
      const isIocComponent = meta.got(NAMESPACE.COMPONENT, false);
      if (isIocComponent) {
        AnnotationDependenciesAutoRegister(component as TClassIndefiner<M>, TypeClientContainer);
        // @ts-ignore
        const typedComponent = TypeClientContainer.get<M>(component);
        const _component = useComponent(typedComponent);
        return ClassMetaCreator.define(NAMESPACE.TEMPLATE, _component)(target);
      }
    } else {
      ClassMetaCreator.define(NAMESPACE.TEMPLATE, component)(target);
    }
  }
}