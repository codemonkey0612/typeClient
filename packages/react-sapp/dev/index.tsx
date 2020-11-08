import { bootstrp, Context, useMiddleware, State, onContextCreated } from '@typeclient/core';
import React from 'react';
import { ReactApplication, useReactiveState } from '../src';
import { Component, ComponentTransform } from '../src/annotations';

type TCount = {
  count: number
}

@Component()
@State<TCount>(() => ({ count: 0, }))
@onContextCreated(ctx => console.log('in onContextCreated'))
@useMiddleware(async (ctx: Context<TCount>, next) => {
  console.log('in middleware');
  ctx.state.count = 1;
  await next()
})
class Components implements ComponentTransform {
  render(props: React.PropsWithoutRef<Context<TCount>>) {
    const count = useReactiveState(() => props.state.count)
    return <div>123 - {count}</div>
  }
}

const app = new ReactApplication(document.getElementById('app'));
app.render(Components);

app.onError(() => {
  return <div>err</div>
});

bootstrp();