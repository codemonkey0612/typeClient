import { TAnnotationScanerMethod, NAMESPACE, TClassIndefiner } from "../../annotation";
import { Context } from "../context";
import { TypeClientContainer } from "../../ioc";

export declare class ExceptionTransfrom<C extends Context> {
  public catch(error: Error, options: {
    ctx: C,
    metadata: TAnnotationScanerMethod
  }): any | Promise<any>;
}

export class ExceptionConsumer<C extends Context> {
  async catch(error: Error, method: TAnnotationScanerMethod, ctx: C) {
    const exception = this.getExceptorsIndefiners(method);
    if (!exception) return await Promise.resolve(ctx.app.getError(error, ctx));
    const target = TypeClientContainer.get<ExceptionTransfrom<C>>(exception);
    if (!target) return await Promise.resolve(ctx.app.getError(new Error('Cannot find the ioc object on TypeClientContainer.'), ctx));
    return await Promise.resolve(target.catch(error, { ctx, metadata: method }));
  }
  private getExceptorsIndefiners(method: TAnnotationScanerMethod) {
    const parent = method.meta.parent;
    const classHttpExceptors = parent.got<TClassIndefiner<ExceptionTransfrom<C>>>(NAMESPACE.EXCEPTION, null);
    const propertyHttpExceptors = method.meta.got<TClassIndefiner<ExceptionTransfrom<C>>>(NAMESPACE.EXCEPTION, null);
    return propertyHttpExceptors || classHttpExceptors || null;
  }
}