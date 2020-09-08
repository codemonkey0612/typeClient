import { Context } from "./context";
import { MiddlewareTransforms } from "./transforms/middleware";
import { TAnnotationScanerMethod } from "../annotation";
import { ExceptionConsumer } from "./transforms/expception";
export async function ContextTransforming<T extends object = {}>(
  ctx: Context<T>, 
  method: TAnnotationScanerMethod, 
  callback: () => Promise<unknown>
) {
  const middlewareConsumer = new MiddlewareTransforms();
  return await Promise.all([
    middlewareConsumer.compose(ctx, method),
    callback()
  ]).then(() => {
    if (ctx.status.value === 200) {
      return Promise.resolve(ctx.$e.emit('context.create'));
    }
  }).catch(async e => {
    if (typeof e === 'function') {
      // side effect;
      e();
    } else if (ctx.status.value === 100) {
      const consumer = new ExceptionConsumer();
      ctx.error.value = await consumer.catch(e, method, ctx);
      ctx.status.value = 500;
    }
  });
}

export async function RedirectionTransforing<T extends object = {}>(
  ctx: Context<T>, 
  method: TAnnotationScanerMethod, 
  server: any, 
  key: string,
  defaultUrl?: string | boolean
) {
  const middlewareConsumer = new MiddlewareTransforms();
  let url: string = null;
  await middlewareConsumer.common(ctx, method, async (ctx, next) => {
    url = await Promise.resolve(server[key](ctx));
    await next();
  });
  ctx.status.value = 200;
  if (typeof url === 'string') {
    ctx.replace(url);
  } else if (typeof defaultUrl === 'string') {
    ctx.replace(defaultUrl);
  } else {
    throw new Error('Redirection Function must return a value of string.');
  }
}