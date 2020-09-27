import { Context } from "../../application";
import { MethodMetaCreator } from "../implemention";
import { NAMESPACE } from "./namespace";

export function onContextCreated<T extends Context>(callback: (ctx: T) => void) {
  return MethodMetaCreator.unshift(NAMESPACE.CONTEXTCREATED, callback);
}