import { ComposedMiddleware } from "../../application/compose";
import { Context } from "../../application";
import { TClassIndefiner, ClassMetaCreator, MethodMetaCreator } from "../implemention";
import { MiddlewareTransform } from "../../application/transforms/middleware";
import { useInject } from "./inject";
import { NAMESPACE } from "./namespace";
import { injectable } from "inversify";

export function useMiddleware<
  C extends Context,
  M extends TClassIndefiner<MiddlewareTransform<C>>
>(...args: (ComposedMiddleware<C> | M)[]) {
  return <T>(target: Object, property?: string | symbol, descripor?: TypedPropertyDescriptor<T>) => {
    const classModules = args.filter(arg => {
      const isMiddlewareLike = !!(arg.prototype && arg.prototype.use);
      if (!isMiddlewareLike) return false;
      const instance = ClassMetaCreator.instance(arg);
      const isMiddleware = instance.got(NAMESPACE.MIDDLEWARE, false);
      if (!isMiddleware) return false;
      return true;
    }) as M[];
    useInject(...classModules)(target, property, descripor);
    if (!property) {
      ClassMetaCreator.unshift(NAMESPACE.MIDDLEWARE, ...args)(target as Function);
    } else {
      MethodMetaCreator.unshift(NAMESPACE.MIDDLEWARE, ...args)(target, property, descripor);
    }
  }
}

export function Middleware() {
  return ClassMetaCreator.join(
    ClassMetaCreator.define(NAMESPACE.MIDDLEWARE, true),
    injectable()
  )
}