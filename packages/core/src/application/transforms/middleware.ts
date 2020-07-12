import { ComposeMiddleware, ComposeNextCallback, Compose } from "../compose";
import { Context } from "../context";
import { TAnnotationScanerMethod, NAMESPACE, TClassIndefiner } from "../../annotation";
import { TypeClientContainer } from "../../ioc";

export declare class MiddlewareTransform<C extends Context> {
  use(context: C, next: ComposeNextCallback): Promise<unknown>;
}

export class MiddlewareTransforms<C extends Context> {
  public compose(ctx: C, method: TAnnotationScanerMethod) {
    const classModules = this.getMiddlewareIndefiners(method);
    const middlewares = classModules.map(classModule => {
      if ((classModule as TClassIndefiner<MiddlewareTransform<C>>).prototype && (classModule as TClassIndefiner<MiddlewareTransform<C>>).prototype.use) {
        return async (ctx: C, next: ComposeNextCallback) => {
          const target = TypeClientContainer.get<MiddlewareTransform<C>>(classModule);
          if (!target) throw new Error('Cannot find the ioc object on TypeClientContainer.')
          await target.use(ctx, next);
        }
      }
      return classModule;
    });
    middlewares.push(async (ctx, next) => {
      ctx.status.value = 200;
      await next();
    });
    return Compose(middlewares as ComposeMiddleware<C>[])(ctx);
  }

  private getMiddlewareIndefiners(method: TAnnotationScanerMethod) {
    const parent = method.meta.parent;
    const classHttpMiddlewares = parent.got(NAMESPACE.MIDDLEWARE, []);
    const propertyHttpMiddlewares = method.meta.got(NAMESPACE.MIDDLEWARE, []);
    return [].concat(classHttpMiddlewares).concat(propertyHttpMiddlewares) as (TClassIndefiner<MiddlewareTransform<C>> | ComposeMiddleware<C>)[];
  }
}