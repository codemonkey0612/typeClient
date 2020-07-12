import { MethodMetaCreator } from "../implemention";
import { NAMESPACE } from "./namespace";

export function Route(url: string = '/') {
  return MethodMetaCreator.unshift(NAMESPACE.PATH, url);
}