import { ClassMetaCreator, Context } from "@typeclient/core";
import { NAMESPACE } from "./namespace";

export function onContextCreated<T extends Context>(...callbacks: ((ctx: T) => void)[]) {
  return ClassMetaCreator.unshift(NAMESPACE.CREATED, ...callbacks);
}