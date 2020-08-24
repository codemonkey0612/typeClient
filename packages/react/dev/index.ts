import React, { useState } from 'react';
import { ReactApplication, useContextState, Template, Component, useContextEffect, ComponentTransform, useComponent, useSlot } from '../src';
import { bootstrp, Controller, Route, State, Context, useMiddleware, useException, usePopStateHistoryMode, Redirect, Middleware, Exception } from '@typeclient/core';
import { injectable, inject } from 'inversify';
import { MiddlewareTransform } from '@typeclient/core/dist/application/transforms/middleware';
import { ComposeNextCallback } from '@typeclient/core/dist/application/compose';
import { ExceptionTransfrom } from '@typeclient/core/dist/application/transforms/expception';


usePopStateHistoryMode()

@injectable()
class Abc {

  abc() {
    
    return 123;
  }
}

@Component()
class ttt implements ComponentTransform {
  @inject(Abc) private Abc: Abc;
  public render(props: React.PropsWithoutRef<{ x?: number}>) {
    return React.createElement('div', null, '123evio-' + this.Abc.abc());
  }
}

@Component()
class uxx implements ComponentTransform {
  render(props: any) {
    return React.createElement('div', null, 
      React.createElement('h2', null, 'tessssssss'),
    );
  }
}

function axx(props: any) {
  const { Consumer } = useSlot(props.app)
  return React.createElement('div', null, 
  React.createElement('h1', null, 'eeee'),
  React.createElement(Consumer, { name: 'header' }, 'defalut header ====='),
  React.createElement('hr'),
  React.createElement(Consumer, { name: 'footer' }, 'defalut footer ====='),
  React.createElement('hr'),
  props.children
);
}

interface TCustomRouteData {
  count: number
}

@Exception()
class CustomError<T extends Context<TCustomRouteData>> implements ExceptionTransfrom<T> {
  catch(e: Error) {
    return React.createElement('h1', null, e.message);
  }
}

@Middleware()
class testMiddleware<T extends Context<TCustomRouteData>> implements MiddlewareTransform<T> {
  async use(ctx: T, next: ComposeNextCallback) {
    // console.log('in')
    // await next();
    ctx.redirect('/ooo')
    // console.log(Number(ctx.query.a), 'in middleware')
    // await new Promise((resolve, reject) => {
    //   let i = 0;
    //   // return reject(new Error('catch error2222'))
    //   const timer = setInterval(() => {
    //     if (i > 3) {
    //       console.log(Number(ctx.query.a), 'setted data')
    //       clearInterval(timer);
    //       resolve();
    //       unbind();
    //     } 
    //     else if (i > 5) {
    //       unbind();
    //       clearInterval(timer);
    //       ctx.redirect('/ooo')
    //     }
    //     else {
    //       ctx.state.count = i++;
    //     }
    //   }, 1000)
    //   const unbind = ctx.useReject(() => {
    //     clearTimeout(timer);
    //     reject();
    //   });
    // });
    // await next();
  }
}



@Controller()
@Template(axx)
class CustomController {
  @inject(Abc) private readonly Abc: Abc;
  @inject(ttt) private readonly ttt: ttt;

  @Route()
  @State<TCustomRouteData>(() => ({ count: 0 }))
  // @useMiddleware(testMiddleware)
  @useException(CustomError)
  test(ctx: Context<TCustomRouteData>) {
    const { count, status } = useContextState(() => {
      return {
        count: ctx.state.count,
        status: ctx.status.value
      }
    });
    useContextEffect(() => {
      console.log('in mount', ctx.req.pathname);
      return () => {
        console.log('in unmount', ctx.req.pathname)
      }
    })

    // @ts-ignore
    const { Provider } = useSlot(ctx.app);

    const Cmp = useComponent(this.ttt);

    // ctx.self.setTimeout(() => {
    //   setA(true)
    // }, 3000)

    return React.createElement(React.Fragment, null, 
      React.createElement('span', null, 'status:' + status),
      React.createElement('h3', null, '-' + ctx.query.a + 'test title' + count),
      React.createElement('button', {
        onClick: () => {
          ctx.state.count = ctx.state.count + this.Abc.abc();
        },
      }, 'add +'),
      React.createElement('button', {
        onClick: () => ctx.redirect('/ooo'),
      }, 'go'),
      Cmp ? React.createElement(Cmp) : null,
      React.createElement(Provider, { name: 'header' }, React.createElement('span', null, 'evio header setted -----')),
      React.createElement(Provider, { name: 'footer' }, 'evio footer setted -----')
    )
  }

  @Route('/ooo')
  sss(ctx: Context) {
    const Val = useComponent(this.ttt);
    useContextEffect(() => {
      console.log('in mount', ctx.req.pathname);
      return () => {
        console.log('in unmount', ctx.req.pathname)
      }
    })
    return React.createElement('div', null, 
      '123 - ' + ctx.status.value, 
      React.createElement(Val), 
      React.createElement('div', { style: { height: '10000px', width: '300px' } }, 'scroller1'),
      React.createElement('div', { id: 'test' }, 'into view'),
      React.createElement('div', { style: { height: '10000px', width: '300px' } }, 'scroller2')
    )
  }

  @Route('/ttt')
  @Redirect('/ooo#test')
  mmm(ctx: Context) {
    
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
