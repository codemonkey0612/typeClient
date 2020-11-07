import { ClassMetaCreator, MethodMetaCreator } from "../implemention";
import { NAMESPACE } from "./namespace";

export function State<T = any>(state: T | (() => T)) {
  return <T>(target: any, property?: string | symbol, descripor?: TypedPropertyDescriptor<T>) => {
    if (!property) return ClassMetaCreator.define(NAMESPACE.STATE, state || {})(target);
    return MethodMetaCreator.define(NAMESPACE.STATE, state || {})(target, property, descripor);
  }
}

export function mergeState(...args: (() => any)[]) {
  return () => {
    return args.reduce((prev, next) => {
      return Object.assign(prev, next());
    }, {});
  }
}