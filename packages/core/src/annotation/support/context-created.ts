import { Context } from "../../application";
import { ClassMetaCreator, MethodMetaCreator } from "../implemention";
import { NAMESPACE } from "./namespace";

export function onContextCreated<T extends Context>(...callbacks: ((ctx: T) => void)[]) {
  return <T>(target: Object | Function, property?: string | symbol, descripor?: TypedPropertyDescriptor<T>) => {
    if (!property) return ClassMetaCreator.unshift(NAMESPACE.CONTEXTCREATED, ...callbacks)(target as Function);
    return MethodMetaCreator.unshift(NAMESPACE.CONTEXTCREATED, ...callbacks)(target as Object, property, descripor);
  }
}