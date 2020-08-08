---
home: true
heroImage: https://vuepress.vuejs.org/hero.png
heroText: Type Client
tagline: 一套轻量的前端微应用开发框架
actionText: 快速上手 →
actionLink: /zh/guide
features:
- title: AOP
  details: 类似JAVA的面向切片编程，使得开发过程全面解偶。
- title: iOC
  details: 是面向对象编程中的一种设计原则，可以用来减低计算机代码之间的耦合度。
- title: Middleware
  details: 中间件就是匹配路由之前或者匹配路由完成之后所得一系列操作
footer: MIT Licensed | Copyright © 2020-present Evio Shen
---

# TypeClient Usage

它是一套通用的路由管理的微应用架构，支持通过驱动方式接入的任意渲染架构或者库。它具有以下有点：

1. 快速匹配路由到组件
1. 基于[AOP](https://baike.baidu.com/item/AOP/1332219)模式快速编写路由
1. 基于[IOC: Inversion of Control](https://baike.baidu.com/item/%E6%8E%A7%E5%88%B6%E5%8F%8D%E8%BD%AC?fromtitle=Inversion+of+Control&fromid=11298462)模型，快速实现服务的反转控制。
1. 支持中间件模型
1. 支持路由生命周期
1. 通过事件分发快速构建不同渲染架构的驱动
1. 轻量的体积

## Why？

前端路由一般性能不是瓶颈，但是在一些渲染架构上，比如`React`上，在量级非常大的组件下，DIFF就显得非常笨拙：

```ts
const routes = (
  <Route component={App}>
    <Route path="groups" components={{main: Groups, sidebar: GroupsSidebar}}/>
    <Route path="users" components={{main: Users, sidebar: UsersSidebar}}>
      <Route path="users/:userId" component={Profile}/>
    </Route>
    // ... 10000个routers
  </Route>
)
```

当匹配到的路由正巧命中最后一个，这时候`<Route />`组件diff了正好10000个，相当于循环中需要匹配10000次，在不断更新的vDom上，它的性能是非常差的。

当然有人会问实际业务场景中不可能存在如此之多的路由。是的，这确实不可能存在，但是对于性能的压榨前提下，我们需要更高性能的路由匹配模式。而`TypeClient`正好采用了高性能的字符串索引算法[radixtree](https://en.wikipedia.org/wiki/Radix_tree)来解决这个问题。

## Stage

其实它的确切适应场景实在复杂的后台系统中。`TypeClient`将路由与过程解偶，通过`Context`、`Middleware`以及`LifeCycle`等概念将开发流程切分开来，让开发者可以非常自由地将逻辑嵌入到所需要的过程中，而不是冗余地堆砌在一起。

如果您熟悉`express`或者`koa`的nodejs的服务开发，那么您将非常快速地上手这个架构，您也会在使用架构的过程中享受到服务端开发模式带来的乐趣。

> 其实`TypeClient`的流程化思想来源于后端，正如`nestjs`的思想来源于`Angular`一样。

对于轻量级应用，您也是可以使用的，它基本涵盖所有路由使用场景。对于路由非强依赖的项目，它的优势仅突出在过程解偶上。所以，使用此架构请先确定项目是否真的需要用到它。

## Modules

- [x] **@typeclient/core** 核心模块
- [x] **@typeclient/react** react支持的驱动
- [ ] **@typeclient/vue** vue支持的驱动
- [x] **@typeclient/axios** axios请求支持
- [x] **@typeclient/responsive** 持久化存储支持 `localStorage` `sessionStorage` and `cookie`

> `@typeclient/vue` 将在vue3发布正式版后开源。

## Repositories

- [TypeClient](https://github.com/flowxjs/TypeClient) 核心架构仓库
- [TypeClientReactTemplate](https://github.com/flowxjs/TypeClientReactTemplate) react项目模板仓库

## Preview

先看一个例子：

[![Edit flowxjs/TypeClientReactTemplate](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/flowxjs/TypeClientReactTemplate/tree/master/?fontsize=14&hidenavigation=1&theme=dark)

我们可以优先预览下它的写法，我们以`React`为例：

```tsx
// index.ts
import React from 'react';
import { bootstrp, usePopStateHistoryMode } from '@typeclient/core';
import { ReactApplication } from '@typeclient/react';
import { CustomController } from './controller';

// 使用HTML5的popstate模式，默认使用hashchange模式
usePopStateHistoryMode();

// 创建实例
const app = new ReactApplication({
  el: document.getElementById('root'),
  prefix: '/'
});

// 注册controller
app.setController(CustomController);

// 当过程捕获错误时候我们返回一个ReactElement渲染在页面上
app.onError((err, ctx) => {
  return <section>
    <h1>Error on {ctx.req.pathname}:</h2>
    {err.message}
  </section>;
});

// 当没有匹配到路由的时候
app.onNotFound(req => {
  return <section>
    <h1>Not Found:</h2>
    find on {req.pathname}
  </section>;
});

// 启动服务
bootstrp();
```

> 您也可以通过 `new ReactApplication()` 创建多个实例在一个页面上。

以上是一个启动文件，我们来看一下路由文件：

```ts
// controller.tsx
import React from 'react';
import { Controller, Route, Context } from '@typeclient/core';

@Controller()
export class CustomController {
  @Route()
  test(ctx: Context) {
    return <p>Hello world!</p>
  }
}
```

启动项目后你可以在页面上看到`Hello world!`。

## Elegant 

确实，看起来非常优雅的写法。当然在preview demo上看到的只是最简单的使用。如果需要了解更多，请参考官方文档。

> TypeClient 提供给你的是另一种前端项目开发的模式，请不要局限在社区开源的全家桶，您应该尽可能地学习到更多社区意外好的设计以及思想。