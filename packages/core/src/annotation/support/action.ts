import { MethodMetaCreator } from "../implemention";
import { injectable } from "inversify";
import { NAMESPACE } from "./namespace";
import { Context } from "../../application/context";

export function Action(...callbacks: ((ctx: Context<any>, data: any) => Promise<void>)[]) {
  return MethodMetaCreator.join(
    injectable(),
    MethodMetaCreator.unshift(NAMESPACE.ACTION, ...callbacks)
  )
}