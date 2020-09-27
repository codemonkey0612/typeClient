import React, { Fragment, useCallback, useEffect } from 'react';
import { ReactApplication, useContextState, Template, Component, useContextEffect, ComponentTransform, useComponent, useSlot, useReactiveState } from '../src';
import { bootstrp, Controller, Route, State, Context, usePopStateHistoryMode, Redirect, ComposeNextCallback, useMiddleware, onContextCreated } from '@typeclient/core';
import { inject } from 'inversify';


usePopStateHistoryMode()

interface TCustomRouteData {
  count: number
}

async function mm(ctx: TC, next: ComposeNextCallback) {
  const id = Number(ctx.query.id) || 0;
  console.log('id:', id)
  if (id > 0) {
    ctx.state.count = 0;
  } else {
    ctx.state.count = 100;
  }
  await next();
}

@Component()
class View implements ComponentTransform {
  render(props: React.PropsWithoutRef<{onClick: () => void}>) {
    return <div onClick={props.onClick}>s6666</div>
  }
}

type TC = Context<TCustomRouteData>


@Controller('/editor')
@Template(Templater)
class CustomController {
  @inject(View) private readonly View: View;
  @Route('/test')
  @State<TCustomRouteData>(() => ({ count: 0 }))
  @useMiddleware(mm)
  @onContextCreated(ctx => {
    console.log(ctx, 'ctx');
  })
  test(ctx: TC) {
    const count = useReactiveState(() => ctx.state.count);
    const id = Number(ctx.query.id) || 0;
    console.log('in cmp', id, count, ctx.state.count)
    useEffect(() => {
      console.log('mounted');
      return () => {
        console.log('unmounted')
      }
    }, []);
    const { Provider } = useSlot(ctx.app);
    const View = useComponent(this.View);

    const click = () => {
      console.log('clicked');
      ctx.redirect('/editor/test?id=' + (id + 1))
    };

    return <Fragment>
      <div onClick={() => ctx.redirect('/editor/v')}>[{id}]123 + {count}</div>
      <Provider name="slot"><View onClick={click} /></Provider>
      {/* <Provider name="slot">dafsdf</Provider> */}
    </Fragment>;
  }

  @Route('/v')
  aa() {
    return <div>111</div>
  }
}

const app = new ReactApplication({
  el: document.getElementById('app'),
  prefix: '/app'
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