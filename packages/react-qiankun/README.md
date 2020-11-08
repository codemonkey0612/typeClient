# @typeclient/react-qiankun

微前端加载组件和中间件
  
## Usage

```ts
import React from 'react';
import { ReactApplication } from '@typeclient/react';
import { bootstrp, Context, Controller, Route, useMiddleware } from '@typeclient/core';
import { LoadMicroApp, LoadMicroAppMiddleware } from '@typeclient/react-qiankun';

@Controller()
class Main {
  @Route()
  @useMiddleware(LoadMicroAppMiddleware)
  Page(ctx: Context) {
    return <LoadMicroApp id="test" src="http://192.168.31.148:8080/" context={ctx} state={{ a: 1 }} />;
  }
}

const app = new ReactApplication({
  el: document.getElementById('app')
});

app.setController(Main);
app.onNotFound(() => <div>not found</div>);
app.onError(err => <div>{err.message}</div>);

bootstrp();
```