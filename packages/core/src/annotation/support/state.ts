import { MethodMetaCreator } from "../implemention";
import { NAMESPACE } from "./namespace";

export function State<T = any>(state: T | (() => T)) {
  return MethodMetaCreator.define(NAMESPACE.STATE, state || {});
}

export function mergeState(...args: (() => any)[]) {
  return () => {
    return args.reduce((prev, next) => {
      return Object.assign(prev, next());
    }, {});
  }
}