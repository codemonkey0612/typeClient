import React, { Fragment, useCallback, useEffect } from 'react';
import { ReactApplication, useContextState, Template, Component, useContextEffect, ComponentTransform, useComponent, useSlot } from '../src';
import { bootstrp, Controller, Route, State, Context, usePopStateHistoryMode } from '@typeclient/core';
import { inject } from 'inversify';


usePopStateHistoryMode()

interface TCustomRouteData {
  count: number
}

@Component()
class View implements ComponentTransform {
  render() {
    return <div>s6666</div>
  }
}

type TC = Context<TCustomRouteData>


@Controller()
@Template(Templater)
class CustomController {
  @inject(View) private readonly View: View;
  @Route('/test/:id(\\d+)')
  @State<TCustomRouteData>(() => ({ count: 0 }))
  test(ctx: TC) {
    const count = useContextState(() => ctx.state.count);
    const id = Number(ctx.params.id);
    useEffect(() => {
      console.log('mounted');
      return () => {
        console.log('unmounted')
      }
    }, []);
    const { Provider } = useSlot(ctx.app);
    const View = useComponent(this.View);

    const click = useCallback(() => {ctx.redirect('/test/' + (id+1))}, [id])

    return <Fragment>
      <div onClick={click}>[{id}]123 + {count}</div>
      <Provider name="slot"><View /></Provider>
    </Fragment>;
  }
}

const app = new ReactApplication({
  el: document.getElementById('app'),
  prefix: '/'
});

app.setController(CustomController);

app.on('Application.onError', (err, ctx) => {
  return React.createElement('h2', null, err.message);
})

app.on('Application.onNotFound', (req) => {
  return React.createElement('h2', null, req.pathname);
})

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