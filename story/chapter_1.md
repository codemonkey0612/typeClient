# 如何利用AOP+IOC思想结构前端项目开发

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