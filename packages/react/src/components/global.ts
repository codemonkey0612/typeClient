import React, { useState } from 'react';
import { ReactApplication } from '../react';
import { Context } from '@typeclient/core';

export type TReactPortalContext<T extends Context = Context> = {
  template: React.FunctionComponent<T>,
  slot: React.FunctionComponent<T>,
  context: T
}

export function CreateGlobalComponent(app: ReactApplication): React.FunctionComponent {
  return () => {
    const [{ template, slot, context }, setComponents] = useState<TReactPortalContext>({ template: null, slot: null, context: null });
    const Template = template || DefaultTemplate;
    const Slot = slot || DefaultSlot;

    app.setPortalReceiver(setComponents);

    return React.createElement(app.slotContext.Provider, {
      value: app.slotState
    }, React.createElement(Template, context, React.createElement(Slot, context)));
  }
}

function DefaultTemplate(props: React.PropsWithChildren<any>) {
  return props.children;
}

function DefaultSlot<T extends Context = Context>(props: React.PropsWithChildren<T>): null {
  return null;
}