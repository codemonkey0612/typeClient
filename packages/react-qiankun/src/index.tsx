import React, { useEffect, useMemo, useRef, useState } from 'react';
import { loadMicroApp, MicroApp, initGlobalState, MicroAppStateActions, addGlobalUncaughtErrorHandler, addErrorHandler, removeErrorHandler, removeGlobalUncaughtErrorHandler } from 'qiankun';
import { ComposeNextCallback, Context, Middleware, MiddlewareTransform } from '@typeclient/core';
import { useContextEffect } from '@typeclient/react';

interface TLoadMicroAppProps<T extends Context = Context> extends React.HTMLAttributes<HTMLDivElement> {
  id: string,
  src: string,
  context: T,
  state?: any,
}

export function LoadMicroApp(props: React.PropsWithoutRef<TLoadMicroAppProps>) {
  const ref = useRef<HTMLDivElement>();
  const app = useRef<MicroApp>(null);
  const [mounted, setMounted] = useState(false);
  const attributes = getNativeAttributes(props);
  const actions: MicroAppStateActions = useMemo(() => initGlobalState(), []);
  useContextEffect(() => {
    app.current = loadMicroApp({
      name: props.id,
      entry: props.src,
      container: ref.current,
      props: props.state,
    }, {
      sandbox: {
        strictStyleIsolation: true,
        experimentalStyleIsolation: true,
      }
    });
    app.current.mountPromise
      .then(() => setMounted(true))
      .catch(e => {
        app.current.unmount();
        return Promise.reject(e);
      })
      .catch(e => {
        props.context.app.emitError(e, props.context)
      });
    return () => app.current.unmount();
  });

  useEffect(() => {
    if (mounted) {
      actions.setGlobalState(props.state);
    }
  }, [props.state, mounted]);

  return <div ref={ref} {...attributes}></div>;
}

@Middleware()
export class LoadMicroAppMiddleware implements MiddlewareTransform {
  async use(ctx: Context, next: ComposeNextCallback) {
    const handler = (error: Error) => ctx.app.emitError(error, ctx);
    const errorEvent = (event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) => ctx.app.emitError(error || new Error('qiankun load faild'), ctx);
    ctx.useEffect(() => {
      addErrorHandler(handler);
      addGlobalUncaughtErrorHandler(errorEvent);
      return () => {
        removeErrorHandler(handler);
        removeGlobalUncaughtErrorHandler(errorEvent);
      }
    });
    await next();
  }
}

function getNativeAttributes(props: React.PropsWithoutRef<TLoadMicroAppProps>) {
  const attrs: Record<string, any> = {};
  for (const i in props) {
    if (['id', 'src', 'context', 'state'].indexOf(i) === -1 && Object.prototype.hasOwnProperty.call(props, i)) {
      attrs[i] = props[i as keyof typeof props];
    }
  }
  return attrs;
}