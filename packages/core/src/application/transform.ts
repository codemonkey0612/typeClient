import { Context } from "./context";
import { MiddlewareTransforms } from "./transforms/middleware";
import { TAnnotationScanerMethod } from "../annotation";
import { ExceptionConsumer } from "./transforms/expception";
export async function ContextTransforming<T extends object = {}>(ctx: Context<T>, method: TAnnotationScanerMethod) {
  const middlewareConsumer = new MiddlewareTransforms();
  return await middlewareConsumer.compose(ctx, method)
  .then(() => {
    if (ctx.status.value === 200) {
      return Promise.resolve(ctx.$e.emit('context.create'));
    }
  })
  .catch(async (e?: Error) => {
    if (ctx.status.value !== 900) {
      const consumer = new ExceptionConsumer();
      ctx.error.value = await consumer.catch(e, method, ctx);
      ctx.status.value = 500;
    }
  });
}