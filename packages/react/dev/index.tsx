import React, { Fragment, useCallback, useEffect } from 'react';
import { ReactApplication, useContextState, Template, Component, useContextEffect, ComponentTransform, useComponent, useSlot } from '../src';
import { bootstrp, Controller, Route, State, Context, usePopStateHistoryMode, Redirect } from '@typeclient/core';
import { inject } from 'inversify';


usePopStateHistoryMode()

interface TCustomRouteData {
  count: number
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
  test(ctx: TC) {
    const count = useContextState(() => ctx.state.count);
    const id = Number(ctx.query.id) || 0;
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
      <div>[{id}]123 + {count}</div>
      <Provider name="slot"><View onClick={click} /></Provider>
    </Fragment>;
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