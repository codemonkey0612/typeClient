import React, { useState } from 'react';
import { ReactApplication } from './react';
import { Context } from '@typeclient/core';

export type TReactPortalContext<T extends Context = Context> = {
  component: React.FunctionComponent<T>,
  context: T
}

export function CreateGlobalComponent(app: ReactApplication): React.FunctionComponent {
  return () => {
    const [{ component, context }, setComponents] = useState<TReactPortalContext>({ component: null, context: null });
    app.setPortalReceiver(setComponents);
    const Component = component || DefaultComponent;
    return React.createElement(Component, context);
  }
}

function DefaultComponent<T extends Context = Context>(props: React.PropsWithChildren<T>): null {
  return null;
}