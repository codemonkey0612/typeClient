# 如何利用AOP+IOC思想解构前端项目开发

本文将通过 [TypeClient](https://github.com/flowxjs/TypeClient) 架构来阐述如何利用AOP+IOC思想来解构前端项目的开发。

首先声明，AOP+IOC思想的理解需要有一定的编程架构基础。目前，这两大思想使用的场景，基本都在nodejs端，在前端的实践非常少。我本着提供一种新的项目解构思路的想法，而非推翻社区庞大的全家桶。大家看看就好，如果能给你提供更好的灵感，那么再好不过了，非常欢迎交流。

**以下我们将以 TypeClient 的 React 渲染引擎为例。**

## AOP

一种面向切面编程的思想。它在前端的表现是前端的装饰器，我们可以通过装饰器来拦截函数执行前与执行后的自定义行为。

> AOP的主要作用是把一些跟核心业务逻辑模块无关的功能抽离出来，这些跟业务逻辑无关的功能通常包括日志统计、安全控制、异常处理等。把这些功能抽离出来之后， 再通过“动态织入”的方式掺入业务逻辑模块中。
> AOP的好处首先是可以保持业务逻辑模块的纯净和高内聚性，其次是可以很方便地复用日志统计等功能模块。

以上是网络上对AOP的简单解释。那么实际代码也许是这样的

```js
@Controller()
class Demo {
  @Route() Page() {}
}
```

但很多时候，我们仅仅是将某个class下的函数当作一个储存数据的对象而已，而在确定运行这个函数时候拿出数据做自定义处理。可以通过 [reflect-metadata](http://npmjs.com/reflect-metadata) 来了解更多装饰器的作用。

## IOC

Angular难以被国内接受很大一部分原因是它的理念太庞大，而其中的DI(dependency inject)在使用时候则更加让人迷糊。其实除了DI还有一种依赖注入的思想叫 IOC。它的代表库为 [inversify](https://www.npmjs.com/package/inversify)。它在github上拥有6.7K的star数，在依赖注入的社区里，口碑非常好。我们可以先通过这个库来了解下它对项目解构的好处。

例子如下：

```ts
@injectable()
class Demo {
  @inject(Service) private readonly service: Service;
  getCount() {
    return 1 + this.service.sum(2, 3);
  }
}
```
> 当然，Service已经优先被注入到inversify的container内了，才可以通过 TypeClient 这样调用。

## 重新梳理前端项目运行时

一般地，前端项目会经过这样的运行过程。

1. 通过监听`hashchange`或者`popstate`事件拦截浏览器行为。
1. 设定当前获得的`window.location` 数据如何对应到一个组件。
1. 组件如何渲染到页面。
1. 当浏览器URL再次变化的时候，我们如何对应到一个组件并且渲染。

这是社区的通用解决方案。当然，我们不会再讲解如何设计这个模式。我们将采用全新的设计模式来解构这个过程。

### 重新审视服务端路由体系

我们聊的是前端的架构，为什么会聊到服务端的架构体系？

那是因为，其实设计模式并不局限在后端或者前端，它应该是一种比较通用的方式来解决特定的问题。

那么也许有人会问，服务端的路由体系与前端并不一致，有何意义?

我们以nodejs的http模块为例，其实它与前端有点类似的。http模块运行在一个进程中，通过`http.createServer`的参数回调函数来响应数据。我们可以认为，前端的页面相当于一个进程，我们通过监听相应模式下的事件来响应得到组件渲染到页面。

服务端多个Client发送请求到一个server端端口处理，为什么不能类比到前端用户操作浏览器地址栏通过事件来得到响应入口呢?

答案是可以的。我们称这种方式为 `virtual server` 即基于页面级的虚拟服务。

既然可以抽象称一种服务架构，那当然，我们可以完全像nodejs的服务化方案靠拢，我们可以将前端的路由处理的如nodejs端常见的方式，更加符合我们的意图和抽象。

```js
history.route('/abc/:id(\\d+)', (ctx) => {
  const id = ctx.params.id;
  return <div>{id}</div>;
  // 或者: ctx.body = <div>{id}</div>; 这种更加能理解
})
```

### 改造路由设计

如果是以上的书写方式，那么也可以解决基本的问题，但是不符合我们AOP+IOC的设计，书写的时候还是比较繁琐的，同时也没有解构掉响应的逻辑。

我们需要解决以下问题:

1. 如何解析路由字符串规则?
1. 如何利用这个规则快速匹配到对应的回调函数?

在服务端有很多解析路由规则的库，比较代表的是 [path-to-regexp](https://www.npmjs.com/package/path-to-regexp)，它被使用在[KOA](https://www.npmjs.com/package/koa)等著名架构中。它的原理也就是将字符串正则化，使用当前传入的path来匹配相应的规则从而得到对应的回调函数来处理。但是这种做法有一些瑕疵，那就是正则匹配速度较慢，当处理队列最后一个规则被匹配的时候，所有规则都将被执行过，当路由过多时候性能较差，这一点可以参看我之前写的 [koa-rapid-router超越koa-router性能的100多倍](https://juejin.im/post/6844903797404205070)。还有一点瑕疵是，它的匹配方式是按照你编写顺序匹配的，所以它具有一定的顺序性，开发者要非常注意。比如:

```js
http.get('/:id(\\d+)', () => console.log(1));
http.get('/1234', () => console.log(2));
```

如果我们访问`/1234`，那么它将打印出`1`，而非`2`。

为了解决性能以及优化匹配过程的智能性，我们可以参考 [find-my-way](https://www.npmjs.com/package/find-my-way) 的路由设计体系。具体请看官自己看了，我不解析。总之，它是一种字符串索引式算法，能够快速而智能地匹配到我们需要的路由。著名的 [fastify](https://www.npmjs.com/package/fastiry) 就是采用这个架构来达到高性能的。

### TypeClient 的路由设计

我们可以通过一些简单的装饰器就能快速定义我们的路由，本质还是采用`find-my-way`的路由设计原则。

```js
import React from 'react';
import { Controller, Route, Context } from '@typeclient/core';
import { useReactiveState } from '@typeclient/react';
@Controller('/api')
export class DemoController {
  @Route('/test')
  TestPage(props: Reat.PropsWithoutRef<Context>) {
    const status = useReactiveState(() => props.status.value);
    return <div>Hello world! {status}</div>;
  }
}
// --------------------------
// 在index.ts中只要
app.setController(DemoController);
// 它就自动绑定了路由，同时页面进入路由 `/api/test` 的时候
// 就会显示文本 `Hello world! 200`。
```

> 可见，TypeClient 通过 AOP 理念定义路由非常简单。

### 路由生命周期

当从一个页面跳转到另一个页面的时候，前一个页面的生命周期也随即结束，所以，路由是具有生命周期的。再此，我们将整个页面周期拆解如下:

1. beforeCreate 页面开始加载
1. created 页面加载完成
1. beforeDestroy 页面即将销毁
1. destroyed 页面已经销毁

为了表示这4个生命周期，我们根据React的hooks特制了一个函数`useContextEffect`来处理路由生命周期的副作用。比如:

```js
import React from 'react';
import { Controller, Route, Context } from '@typeclient/core';
import { useReactiveState } from '@typeclient/react';
@Controller('/api')
export class DemoController {
  @Route('/test')
  TestPage(props: Reat.PropsWithoutRef<Context>) {
    const status = useReactiveState(() => props.status.value);
    useContextEffect(() => {
      console.log('路由加载完成了');
      return () => console.log('路由被销毁了');
    })
    return <div>Hello world! {status}</div>;
  }
}
```

其实它与`useEffect`或者`useLayoutEffect`有些类似。只不过我们关注的是路由的生命周期，而react则关注组件的生命周期。

其实通过上面的`props.status.value`我们可以猜测出，路由是有状态记录的，分别是`100`和`200`还有`500`等等。我们可以通过这样的数据来判断当前路由处于什么生命周期内，也可以通过骨架屏来渲染不同的效果。

### 中间件设计

为了控制路由生命周期的运行，我们设计了中间件模式，用来处理路由前置的行为，比如请求数据等等。中间件原则上采用与KOA一致的模式，这样可以大大兼容社区生态。

```js
const middleware = async (ctx, next) => {
  // ctx.....
  await next();
}
```

通过AOP 我们可以轻松引用这个中间件，达到页面加载完毕状态前的数据处理。

```js
import React from 'react';
import { Controller, Route, Context, useMiddleware } from '@typeclient/core';
import { useReactiveState } from '@typeclient/react';
@Controller('/api')
export class DemoController {
  @Route('/test')
  @useMiddleware(middleware)
  TestPage(props: Reat.PropsWithoutRef<Context>) {
    const status = useReactiveState(() => props.status.value);
    useContextEffect(() => {
      console.log('路由加载完成了');
      return () => console.log('路由被销毁了');
    })
    return <div>Hello world! {status}</div>;
  }
}
```

### 设计周期状态管理 - ContextStore

不得不说这个是一个亮点。为什么要设计这样一个模式呢？主要是为了解决在中间件过程中对数据的操作能够及时响应到页面。因为中间件执行与react页面渲染是同步的，所以我们设计这样的模式有利于数据的周期化。

我们采用了非常黑科技的方案解决这个问题：`@vue/reactity`

对，就是它。

我们在react中嵌入了`VUE3`最新的响应式系统，让我们开发快速更新数据，而放弃掉`dispatch`过程。当然，这对中间件更新数据是及其有力的。

> 这里 我非常感谢 [sl1673495](https://github.com/sl1673495/react-composition-api) 给到的黑科技思路让我们的设计能够完美兼容react。

我们通过`@State(callback)`来定义ContextStore的初始化数据，通过`useContextState`或者`useReactiveState`跟踪数据变化并且响应到React页面中。

来看一个例子:

```js
import React from 'react';
import { Controller, Route, Context, useMiddleware, State } from '@typeclient/core';
import { useReactiveState } from '@typeclient/react';
@Controller('/api')
export class DemoController {
  @Route('/test')
  @useMiddleware(middleware)
  @State(createState)
  TestPage(props: Reat.PropsWithoutRef<Context>) {
    const status = useReactiveState(() => props.status.value);
    const count = useReactiveState(() => props.state.count);
    const click = useCallback(() => ctx.state.count++, [ctx.state.count]);
    useContextEffect(() => {
      console.log('路由加载完成了');
      return () => console.log('路由被销毁了');
    })
    return <div onClick={click}>Hello world! {status} - {count}</div>;
  }
}

function createState() {
  return {
    count: 0,
  }
}
```

你可以看到不断点击，数据不断变化。这种操作方式极大简化了我们数据的变化写法，同时也可以与vue3响应式能力看齐，弥补react数据操作复杂度的短板。

### 利用IOC思想解构项目

以上的讲解都没有设计IOC方面，那么下面将讲解IOC的使用。

#### Controller 服务解构

我们先编写一个Service文件

```js
import { Service } from '@typeclient/core';

@Service()
export class MathService {
  sum(a: number, b: number) {
    return a + b;
  }
}
```

然后我们可以在之前的Controller中直接调用:

```js
import React from 'react';
import { Controller, Route, Context, useMiddleware, State } from '@typeclient/core';
import { useReactiveState } from '@typeclient/react';
import { MathService } from './service.ts';
@Controller('/api')
export class DemoController {
  @inject(MathService) private readonly MathService: MathService;

  @Route('/test')
  @useMiddleware(middleware)
  @State(createState)
  TestPage(props: Reat.PropsWithoutRef<Context>) {
    const status = useReactiveState(() => props.status.value);
    const count = useReactiveState(() => props.state.count);
    const click = useCallback(() => ctx.state.count++, [ctx.state.count]);
    const value = this.MathService.sum(count, status);
    useContextEffect(() => {
      console.log('路由加载完成了');
      return () => console.log('路由被销毁了');
    })
    return <div onClick={click}>Hello world! {status} + {count} = {value}</div>;
  }
}

function createState() {
  return {
    count: 0,
  }
}
```

你可以看到数据的不断变化。

#### Component 解构

我们为react的组件创造了一种新的组件模式，称`IOCComponent`。它是一种具备IOC能力的组件，我们通过`useComponent`的hooks来调用。

```js
import React from 'react';
import { Component, ComponentTransform } from '@typeclient/react';
import { MathService } from './service.ts';

@Component()
export class DemoComponent implements ComponentTransform {
  @inject(MathService) private readonly MathService: MathService;

  render(props: React.PropsWithoutRef<{ a: number, b: number }>) {
    const value = this.MathService.sum(props.a, props.b);
    return <div>{value}</div>
  }
}
```

然后在任意组件中调用

```js
import React from 'react';
import { Controller, Route, Context, useMiddleware, State } from '@typeclient/core';
import { useReactiveState } from '@typeclient/react';
import { MathService } from './service.ts';
import { DemoComponent } from './component';
@Controller('/api')
export class DemoController {
  @inject(MathService) private readonly MathService: MathService;
  @inject(DemoComponent) private readonly DemoComponent: DemoComponent;

  @Route('/test')
  @useMiddleware(middleware)
  @State(createState)
  TestPage(props: Reat.PropsWithoutRef<Context>) {
    const status = useReactiveState(() => props.status.value);
    const count = useReactiveState(() => props.state.count);
    const click = useCallback(() => ctx.state.count++, [ctx.state.count]);
    const value = this.MathService.sum(count, status);
    const Demo = useComponent(this.DemoComponent);
    useContextEffect(() => {
      console.log('路由加载完成了');
      return () => console.log('路由被销毁了');
    })
    return <div onClick={click}>
      Hello world! {status} + {count} = {value} 
      <Demo a={count} b={value} />
    </div>;
  }
}

function createState() {
  return {
    count: 0,
  }
}
```

#### Middleware 解构

我们完全可以抛弃掉传统的中间件写法，而采用能加解构化的中间件写法:

```js
import { Context } from '@typeclient/core';
import { Middleware, MiddlewareTransform } from '@typeclient/react';
import { MathService } from './service';

@Middleware()
export class DemoMiddleware implements MiddlewareTransform {
  @inject(MathService) private readonly MathService: MathService;

  async use(ctx: Context, next: Function) {
    ctx.a = this.MathService.sum(1, 2);
    await next();
  }
}
```

#### 为react新增Slot插槽概念

它支持Slot插槽模式，我们可以通过useSlot获得Provider与Consumer。它是一种通过消息传送节点片段的模式。

```js
const { Provider, Consumer } = useSlot(ctx.app);
<Provider name="foo">provider data</Provider>
<Consumer name="foo">placeholder</Consumer>
```

然后编写一个IOCComponent或者传统组件。

```js
// template.tsx
import { useSlot } from '@typeclient/react';
@Component()
class uxx implements ComponentTransform {
  render(props: any) {
    const { Consumer } = useSlot(props.ctx);
    return <div>
      <h2>title</h2>
      <Consumer name="foo" />
      {props.children}
    </div>
  }
}
```
最后在Controller上调用
```js
import { inject } from 'inversify';
import { Route, Controller } from '@typeclient/core';
import { useSlot } from '@typeclient/react';
import { uxx } from './template.tsx';
@Controller()
@Template(uxx)
class router {
  @inject(ttt) private readonly ttt: ttt;
  @Route('/test')
  test() {
    const { Provider } = useSlot(props.ctx);
    return <div>
      child ...
      <Provider name="foo">
        this is foo slot
      </Provider>
    </div>
  }
}
```

你能看到的结构如下:

```html
<div>
  <h2>title</h2>
  this is foo slot
  <div>child ...</div>
</div>
```