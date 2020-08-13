import { TClassIndefiner, ClassMetaCreator, MethodMetaCreator } from "../implemention";
import { ExceptionTransfrom } from "../../application/transforms/expception";
import { Context } from "../../application";
import { useInject } from "./inject";
import { NAMESPACE } from "./namespace";
import { injectable } from 'inversify';

export function useException<
  C extends Context, 
  T extends ExceptionTransfrom<C>
>(error: TClassIndefiner<T>) {
  return <T>(target: Object, property?: string | symbol, descripor?: TypedPropertyDescriptor<T>) => {
    const instance = ClassMetaCreator.instance(error);
    const isException = instance.got(NAMESPACE.EXCEPTION, false);
    if (isException) {
      useInject(error)(target, property, descripor);
      if (!property) {
        ClassMetaCreator.define(NAMESPACE.EXCEPTION, error)(target as Function);
      } else {
        MethodMetaCreator.define(NAMESPACE.EXCEPTION, error)(target, property, descripor);
      }
    }
  }
}

export function Exception() {
  return ClassMetaCreator.join(
    ClassMetaCreator.define(NAMESPACE.EXCEPTION, true),
    injectable()
  )
}