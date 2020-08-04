import { MethodMetaCreator } from "../implemention";
import { NAMESPACE } from "./namespace";

export function Redirect(url?: string) {
  return MethodMetaCreator.define(NAMESPACE.REDIRECT, url || true);
}