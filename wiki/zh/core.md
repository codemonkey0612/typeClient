---
sidebar: auto
---

# 核心

`@typeclient/core` 主要分两部分组成：

- **Application** 应用主体
- **History** 浏览器history

## 创建一个新的应用

应用可以根据需求在同一个页面上产生多个应用实例，能够同时保证多个框架在一个页面上同时存在。

```ts
import { Application, bootstrap } from '@typeclient/core';

const app1 = new Application();
const app2 = new Application();

app1.setController(controller1);
app2.setController(controller2);

bootstrap();
```

### History模式选择

默认我们使用`hashchange`的模式来驱动，但是你也可以改变它使用`popstate`模式。

```ts
import { usePopStateHistoryMode } from '@typeclient/core';
usePopStateHistoryMode(); // 切换为popstate模式
```

### 应用容错

我们可以通过`app.onError`来进行应用的全局容错。

```tsx
import { Context } from '@typeclient/core';
app.onError((err: Error, ctx: Context) => {
  return <>
    <h1>Catch Error</h1>
    <p>At: {ctx.req.pathname}</p>
    <pre>{err.stack}</pre>
  </>
})
```

### 路由未匹配

我们可以通过`app.onNotFound`来进行路由未匹配时候的自定义页面

```tsx
import { Request } from '@typeclient/core';
app.onNotFound((req: Request) => {
  return <>
    <h1>Not Found</h1>
    <p>At: {req.pathname}</p>
  </>
})
```

### 自定义锚点滚动

我们可以通过`app.onHashAnchor`来进行自定义锚点滚动动画

```ts
app.onHashAnchor((el: HTMLElement) => {
  // ...
})
```

### 绑定路由

通过`setController`绑定路由

```ts
app.setController(ControllerClassObject);
```
### 取消监听路由

```ts
app.unSubscribe();
```

### 监听路由

默认创建新的对象后自动监听路由，如果已取消，那么可以重新绑定监听

```ts
app.subscribe();
```

### Location:Redirect

页面跳转，往history添加一条历史记录

```ts
app.redirect('/test')
```

### Location:Replace

页面跳转，往history覆盖当前历史记录

```ts
app.replace('/test')
```

### Location:Reload

重载页面

```ts
app.reload();
```

### 全局中间件

我们可以通过对全局配置中间件来强调每个路由都经过这些流程。

```ts
app.use(async (ctx, next) => await next());
// or
app.use(iOCMiddleware);
```

## Controller路由引导类

路由类定义以class为基础，也就是说，所有的controller都是class类型的，并且，需要使用注解`@Controller`来包裹。

```tsx
import { Controller } from '@typeclient/core';

@Controller()
export class DemoController {

}
```
### 定义路由前缀

`@Controller(prefix?: string)`中可以定义路由的前缀，也就是说，这个controller下面的每个路由前缀都一致。

```tsx
import { Controller } from '@typeclient/core';
@Controller('/prefix')
class router {}
```

路由不仅仅是静态字符串，也可以是动态变量

```ts
@Controller('/:id')
```

:::warning
如果controller没有参数，意味着 `@Controller() === @Controller('/')`
:::

### 定义路由

`@Route(url?: string)`定义具体的路由地址。

```tsx
import { Route, Controller } from '@typeclient/core';
@Controller()
class router {
  @Route('/test')
  test() {}
}
```
### 使用中间件

中间件是控制页面数据初始化必要的模型。它的主要作用是为页面提供初始化数据或者鉴权等。它的存在能够解偶路由流程。

#### 中间件加载顺序

它是基于洋葱模型而存在，与nodejs生态中的KOA中间件一致。[详解](https://www.jianshu.com/p/c76d9ffd7899)

它与路由主渲染函数组件为同步加载关系，也就是说，主渲染函数组件渲染过程并非在中间件执行之后，而且同步执行的，这样可以保证渲染的非阻塞性。

#### 中间件写法

主要有两种写法：

- 传统中间件写法
- IOC中间件写法

##### 传统中间件

```ts
async function (ctx, next) {
  // ctx....
  await next()
}
```

##### IOC中间件

```ts
import { injectable, inject } from 'inversify';
import { MiddlewareTransform, ComposeNextCallback, Middleware } from '@typeclient/core';

@Middleware()
export class DemoMiddleware<T extends Context> implements MiddlewareTransform<T> {
  @inject(Service) private readonly Service: Service;
  async use(ctx: T, next: ComposeNextCallback) {
    await next();
  }
}
```

#### 在路由上使用中间件

```tsx
import { Route, Controller, useMiddleware } from '@typeclient/core';
@Controller()
class router {
  @Route('/test')
  @useMiddleware(DemoMiddleware)
  test() {}
}
```

当然，同样的，它也可以定义在class全局类上，表示这个controller下所有的路由都经过这个中间件

```tsx
import { Route, Controller, useMiddleware } from '@typeclient/core';
@Controller()
@useMiddleware(DemoMiddleware)
class router {
  @Route('/test')
  test() {}
}
```

中间件执行顺序按书写先后顺序执行。

### 中断中间件执行过程与路由副作用

一般在中间件执行过程中我们可以通过`Promise.reject`来取消执行，但是我们无法将副作用传递出去以便将副作用隔离执行，我们定义了一种新的方式来处理路由的副作用。

```ts
throw () => {}
```

当抛出一个函数，则认为中断路由中间件执行，同时在结束中间件后自动处理副作用。

以下方法就是使用这个原理进行处理:

- `ctx.redirect`
- `ctx.replace`
- `ctx.reload`

### 使用局部容错

它提供一种基于请求的局部容错，与app.onError一样，需要返回一个页面代码。

```tsx
import { ExceptionTransfrom, Exception } from '@typeclient/core';
@Exception()
class CustomError implements ExceptionTransfrom {
  catch(e: Error) {
    return <h1>{e.message}</h1>
  }
}
```

在controller上可以这样使用

```tsx
import { Route, Controller, useMiddleware } from '@typeclient/core';
@Controller()
class router {
  @Route('/test')
  @useException(CustomError)
  test() {}
}
```

当然，你可以在class类上引用，表示这个controller下所有路由都进行CustomError局部容错。

```tsx
import { Route, Controller, useMiddleware } from '@typeclient/core';
@Controller()
@useException(CustomError)
class router {
  @Route('/test')
  test() {}
}
```
### 使用State响应式数据

`@State(data?: object | () => object)` 提供一种响应式数据对象，打通整个求求期间所用到的数据源。

```tsx
import { Route, Controller, State } from '@typeclient/core';
@Controller()
class router {
  @Route('/test')
  @State(() => ({ count: 0 }))
  test() {}
}
```

State中传荣object或者function的区别在于，如果是function类型，那么它将每次重新重建新的数据对象，反之，数据将被缓存，在相同数据结构的对象上不断累积变化。

**mergeState** 整合多个数据源为一个数据源

```tsx
import { Route, Controller, State, mergeState } from '@typeclient/core';
@Controller()
class router {
  @Route('/test')
  @State(mergeState(
    () => ({ count: 0 }),
    () => ({ a: 0 }),
    () => ({ b: 0 })
  ))
  test() {}
}
```

### 使用代理跳转模式

`@Redirect(url?: string)` 将定义这个组件为一个代理跳转函数。经过主代码的返回结果确定跳转地址。

```tsx
import { Route, Controller, Redirect } from '@typeclient/core';
@Controller()
class router {
  @Route()
  @Redirect('/test')
  test() {}  // 将跳转/test

  @Route('/abc')
  @Redirect('/test')
  test2() {
    return '/test2'
  }  // 将跳转/test2
}
```
## Context请求上下文详解

Context非常重要，关系这一切可操作的数据以及函数，我们简称ctx

### ctx.query

请求search上的序列化数据

```ts
// url: /test?a=1&b=2

ctx.query.a === '1';
ctx.query.b === '2';
```

### ctx.params

请求路径上的参数序列化结果

```ts
// router: /test/:id(\\d+)/:name
// url: /test/34/foo

ctx.params.id === '34';
ctx.params.name === 'foo';
```

### ctx.redirect

页面跳转，往history添加一条历史记录

```ts
ctx.redirect('/test')
```

### ctx.replace

页面跳转，往history覆盖当前历史记录

```ts
ctx.replace('/test')
```

### ctx.reload

重载页面

```ts
ctx.reload()
```

### ctx.self

同ctx自身，只不过它将返回原始引用对象，主要用户当ctx作为组件props时候被冻结对象后丢失部分参数的获取原始引用的方式。

### ctx.useReject

当使用这个api后，我们将定义在请求销毁过程中所需要做的行为。它返回一个取消绑定的方法，实际看例子：

```tsx
@injectable()
class testMiddleware<T extends Context<TCustomRouteData>> implements MiddlewareTransform<T> {
  async use(ctx: T, next: ComposeNextCallback) {
    console.log(Number(ctx.query.a), 'in middleware')
    await new Promise((resolve, reject) => {
      let i = 0;
      // return reject(new Error('catch error2222'))
      const timer = setInterval(() => {
        if (i > 3) {
          console.log(Number(ctx.query.a), 'setted data')
          clearInterval(timer);
          resolve();
          unbind();
        } 
        // else if (i > 5) {
        //   unbind();
        //   clearInterval(timer);
        //   reject(new Error('catch error2222'))
        // }
        else {
          ctx.state.count = i++;
        }
      }, 1000)
      const unbind = ctx.useReject(() => {
        clearTimeout(timer);
        reject();
      });
    });
    await next();
  }
}
```

这个api主要使用场景是，当我们A页面发起请求未结束时跳转B页面，这时候，系统将直接abort掉所有A页面未完成的请求。当然，你也可以通过这个api定义自己取消行为的方式。

### ctx.useEffect

当请求处于created生命周期的时候触发内部函数，如果有返回函数，那么就是销毁生命周期下的处理函数。

```tsx
ctx.useEffect(() => {
  // 请求生命周期完成时候触发
  return () => {
    // 请求销毁时候触发
  }
})
```

## FAQ

### app.redirect 与 ctx.redirect 的区别？

`app.redirect`提供跳转的实际执行方法，一旦调用，那么将直接改变历史记录。`ctx.redirect`则不是，它自动判断当前执行场景，如果是在中间件执行过程，那么将行为当作路由副作用传递到中间件执行完毕后执行；如果已经完成中间件执行，那么相当于`app.redirect`去执行。

### 中间件到底是什么？有什么应用场景？

我非常推荐大家去查看[koa](https://npmjs.com/koa)。我们中间件思想来源于koa的中间件思想，可以说是完全一致的。它所能解决的问题就是将我们路由的数据变化部分与UI彻底分离，可以理解为，中间件就是为`@State`注解中的数据提供具体数据源的。这也与我们架构设计有关。

我们的原则是，通过`state + component = page`的模式来渲染页面，所以数据的变化一定会引起页面的变化。中间件就是用来提供初始化数据的。中间件在模型决定了它能够对现有的数据获取逻辑进行解偶。它同时也是一种时序型的设计方案，我们一般称为 [洋葱模型](https://baike.baidu.com/item/%E6%B4%8B%E8%91%B1%E6%A8%A1%E5%9E%8B/7675375?fr=aladdin)。

我们设计IOCMiddleware的初衷是解决中间件无法调用IOC服务数据的痛点，为了使其可以当作一个IOC服务，我们将中间件改造称为一种基于IOC调用方式的中间件模型来让开发变的更加简单。

### Application.prefix vs. Controller.prefix

`Application.prefix`是主应用的一个配置选项，意在真实路由只有以`Application.prefix`的值为前缀的时候才会进入路由。而`Controller.prefix` 则是虚拟路由用来匹配进入哪个controller。以下有个例子：

- 真实路由：`/app/editor/abc`
- Application.prefix = '/app'

那么虚拟路由就是`/editor/abc`，也就是 `Controller.prefix === '/editor/abc'`。系统将会使用整个`/editor/abc`作为选择controller的依据。当然，基于`Application.prefix`，之后所有的`redirect` 以及 `replace` 都会自动加上`Application.prefix`这个前缀。比如： `ctx.redirect="/test"`，那么在浏览器最终看到的真实路由是`/app/test`