import { ComposeMiddleware, ComposeNextCallback, Compose } from "../compose";
import { Context } from "../context";
import { TAnnotationScanerMethod, NAMESPACE, TClassIndefiner } from "../../annotation";
import { TypeClientContainer } from "../../ioc";

export declare class MiddlewareTransform<C extends Context> {
  use(context: C, next: ComposeNextCallback): Promise<unknown>;
}

export class MiddlewareTransforms<C extends Context> {
  public compose(ctx: C, method: TAnnotationScanerMethod) {
    return this.common(ctx, method, async (ctx, next) => {
      ctx.status.value = 200;
      await next();
    });
  }

  public common(ctx: C, method: TAnnotationScanerMethod, callback?: ComposeMiddleware) {
    const classModules = this.getMiddlewareIndefiners(ctx, method);
    const middlewares = this.generateMiddlewares(...classModules);
    callback && middlewares.push(callback);
    return Compose(middlewares)(ctx);
  }

  private getMiddlewareIndefiners(ctx: C, method: TAnnotationScanerMethod) {
    const parent = method.meta.parent;
    const classHttpMiddlewares = parent.got(NAMESPACE.MIDDLEWARE, []);
    const propertyHttpMiddlewares = method.meta.got(NAMESPACE.MIDDLEWARE, []);
    const globalMiddlewares = this.generateMiddlewares(...ctx.app.middlewares);
    return globalMiddlewares
      .concat(classHttpMiddlewares)
      .concat(propertyHttpMiddlewares) as (TClassIndefiner<MiddlewareTransform<C>> | ComposeMiddleware<C>)[];
  }

  private generateMiddlewares<M extends TClassIndefiner<MiddlewareTransform<C>>>(...classModules: (ComposeMiddleware<C> | M)[]): ComposeMiddleware<C>[] {
    return classModules.map(classModule => {
      if ((classModule as TClassIndefiner<MiddlewareTransform<C>>).prototype && (classModule as TClassIndefiner<MiddlewareTransform<C>>).prototype.use) {
        return async (ctx: C, next: ComposeNextCallback) => {
          const target = TypeClientContainer.get<MiddlewareTransform<C>>(classModule);
          if (!target) throw new Error('Cannot find the ioc object on TypeClientContainer.')
          await target.use(ctx, next);
        }
      }
      return classModule as ComposeMiddleware<C>;
    });
  }
}