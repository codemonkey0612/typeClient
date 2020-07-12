import { ReactApplication } from "../react";
import { MethodMetaCreator, TypeClientContainer, AnnotationDependenciesAutoRegister, TClassIndefiner } from "@typeclient/core";
import { NAMESPACE } from "../annotations";
import { FunctionComponent } from "react";

export function useContextComponent<Z, T>(app: ReactApplication, server: T, key: keyof T): React.FunctionComponent<Z> {
  if (server.constructor && server.constructor.prototype && server[key] && typeof server[key] === 'function') {
    const instance = MethodMetaCreator.instance(Object.getOwnPropertyDescriptor(server.constructor.prototype, key));
    AnnotationDependenciesAutoRegister(server.constructor as TClassIndefiner<any>, TypeClientContainer);
    const isComponent = instance.got(NAMESPACE.COMPONENT, false);
    if (isComponent) {
      const fcs = app.FCS;
      if (!fcs.has(server)) fcs.set(server, new Map());
      const target = fcs.get(server);
      if (!target.has(key as string)) {
        const cmp = (server[key] as any).bind(server) as FunctionComponent;
        target.set(key as string, cmp);
      }
      return target.get(key as string);
    }
  }
}