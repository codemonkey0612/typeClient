import { ClassMetaCreator } from "@typeclient/core";
import { NAMESPACE } from "./namespace";

export function State<T = any>(state: T | (() => T)) {
  return ClassMetaCreator.define(NAMESPACE.STATE, state || {});
}