import React from 'react';
import { ReactApplication, useContextState, Template, Component, useContextComponent } from '../src';
import { bootstrp, Controller, Route, State, Context, useMiddleware, useException, usePopStateHistoryMode } from '@typeclient/core';
import { injectable, inject } from 'inversify';
import { MiddlewareTransform } from '@typeclient/core/dist/application/transforms/middleware';
import { ComposeNextCallback } from '@typeclient/core/dist/application/compose';
import { ExceptionTransfrom } from '@typeclient/core/dist/application/transforms/expception';

usePopStateHistoryMode()

interface TCustomRouteData {
  count: number
}

@injectable()
class CustomError<T extends Context<TCustomRouteData>> implements ExceptionTransfrom<T> {
  catch(e: Error) {
    return React.createElement('h1', null, e.message);
  }
}

@injectable()
class testMiddleware<T extends Context<TCustomRouteData>> implements MiddlewareTransform<T> {
  async use(ctx: T, next: ComposeNextCallback) {
    console.log(Number(ctx.query.a), 'in middleware')
    await new Promise((resolve, reject) => {
      // return reject(new Error('catch error2222'))
      const timer = setTimeout(() => {
        ctx.state.count = 999;
        console.log(Number(ctx.query.a), 'setted data 999')
        resolve();
        unbind();
      }, 3000);
      const unbind = ctx.useReject(() => {
        clearTimeout(timer);
        reject();
      });
    });
    await next();
  }
}

@injectable()
class Abc {
  abc() {
    return 123;
  }

  @Component()
  test(props: React.PropsWithoutRef<any>) {
    return React.createElement('p', null, 'hello world');
  }
}

@Controller()
@Template(ZTemplate)
class CustomController {
  @inject(Abc) private readonly Abc: Abc;

  @Route()
  @State<TCustomRouteData>(() => ({ count: 0 }))
  @useMiddleware(testMiddleware)
  @useException(CustomError)
  test(ctx: Context<TCustomRouteData>) {
    const { count, status } = useContextState(() => {
      return {
        count: ctx.state.count,
        status: ctx.status.value
      }
    });

    const Cmp = useContextComponent(ctx.app as ReactApplication, this.Abc, 'test');

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
      Cmp ? React.createElement(Cmp) : null
    )
  }

  @Route('/ooo')
  sss(ctx: Context) {
    return React.createElement('p', null, '123 - ')
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

export const Slot = app.createSlotter();

bootstrp();
function ZTemplate(props: any) {
  return React.createElement('div', null, 
    React.createElement('h2', null, 'tessssssss'),
    React.createElement(Slot, props)
  );
}
