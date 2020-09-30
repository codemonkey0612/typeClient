import React, { Fragment, useCallback, useEffect, useMemo } from 'react';
import { ReactApplication, useContextState, Template, Component, useContextEffect, ComponentTransform, useComponent, useSlot, useReactiveState } from '../src';
import { bootstrp, Controller, Route, State, Context, usePopStateHistoryMode, Redirect, ComposeNextCallback, useMiddleware, onContextCreated } from '@typeclient/core';
import { inject } from 'inversify';


usePopStateHistoryMode()

interface TCustomRouteData {
  count: number
}

async function mm(ctx: TC, next: ComposeNextCallback) {
  ctx.state.count = Math.random() * 10000;
  await next();
}

@Component()
class View implements ComponentTransform {
  render(props: React.PropsWithoutRef<{ ctx: TC }>) {
    console.log('ctx', props.ctx)
    const count = useReactiveState(() => props.ctx.state.count, [props.ctx.id]);
    return <div>s6666 - {count}</div>
  }
}

type TC = Context<TCustomRouteData>


@Controller()
@Template(Templater)
class CustomController {
  @inject(View) private readonly View: View;
  @Route('/a')
  @State<TCustomRouteData>(() => ({ count: 0 }))
  @useMiddleware(mm)
  test(ctx: TC) {
    const count = useReactiveState(() => ctx.state.count);
    const { Provider } = useSlot(ctx.app);
    const View = useComponent(this.View);

    return <Fragment>
      <div onClick={() => ctx.redirect('/b')}>a: {count}</div>
      <Provider name="slot"><View ctx={ctx} /></Provider>
    </Fragment>;
  }

  @Route('/b')
  @State<TCustomRouteData>(() => ({ count: 0 }))
  @useMiddleware(mm)
  aa(ctx: TC) {
    const count = useReactiveState(() => ctx.state.count);
    const { Provider } = useSlot(ctx.app);
    const View = useComponent(this.View);

    return <Fragment>
      <div onClick={() => ctx.redirect('/a')}>a: {count}</div>
      <Provider name="slot"><View ctx={ctx} /></Provider>
    </Fragment>;
  }
}

const app = new ReactApplication({
  el: document.getElementById('app'),
  prefix: '/'
});

app.setController(CustomController);

bootstrp();


function Templater(props: React.PropsWithChildren<Context>) {
  const { Consumer } = useSlot(props.app);
  return <Fragment>
    <h1>This is a title.</h1>
    <Consumer name="slot" />
    <hr/>
    {props.children}
  </Fragment>
}