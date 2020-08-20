---
sidebar: auto
---

# 介绍

它是一套轻量级的前端微应用开发架构，能够在一个页面上同时运行多个应用。在技术栈的选择上，也没有强制性的定义，它可以通过编写驱动引擎来实现对各种渲染引擎的支持。

它的孵化来源于艾耕科技的内部项目，针对路由复杂度高、代码管理混乱以及开发维护不方便的痛点上，我们提出了一种以后端服务开发理念为指引的前端微应用开发模式。它能够解决所有基于路由化的应用场景，并且提高路由匹配的速度，实现高性能路由分发。

## 设计理念

它的产生离不开对后端服务的理解。在后端开发的模型中，多个`client`应对单个`server`的模型给了我们很大灵感。在前端，无非就是单个`client`应对单个server的情况，那么我们就可以将后端的理念移植到前端。非常幸运的是，后端触发请求流转的事件也可以对应到前端，所以我们可以认为，用户的页面请求就是一个相对于后端的`request`请求。这样一来，前端理念已成。

为了将请求处理逻辑解偶，我们采用了`AOP`和`iOC`理念来作为这个架构的基础设计，在代码层面上可以实现几乎类似JAVA注解的模式。再加上将前端各大框架作为渲染引擎，一个完整的架构设计就出来了。

## 遇到的难点

在架构设计之初，我们遇到了一些难点，经过好多个版本的迭代，最终成型。那么我们稍微讲解其中的难点与特殊设计以及技术方案的取舍。

### iOC设计中的自动绑定

我们采用了第三方开源的架构 [inversify](https://www.npmjs.com/inversify)。如果根据这个架构的设计，我们需要不断的进行如下的代码编写：

```ts
Container.bind(ServiceA).toSelf();
Container.bind(ServiceB).toSelf();
Container.bind(ServiceC).toSelf();
// ...
```

如果我们模块多了，忘记绑定注入，那么也许会在调用某个服务的时候报错，提示找不到服务定义，而且每次绑定都是件非常累人的事情。那么为考虑如何将一来自动绑定呢？

通过对`Controller`的设定作为入口，我们提供一个`useInject`方法。这个方法主要是在注解编写时候提供自动注入的能力。比如说：

```ts
const SomeAnnotation = (classModules) => {
  useInject(classModules)
  return (target, property, descriptor) => {
    // ...
  }
}
```
我们将`inversify:container`全局化，然后在`useInject`内部使用`Container.bind(classModules).toSelf()`方法来绑定。当然，我们还需要判断是否这个服务已经被绑定。当一切结束后，你会发现，我们根本不需要关心依赖如何绑定，只需要在什么时候调用就什么时候引用即可。

### 通用响应式对象

为了解决通用性数据响应的问题，我们考虑该如何将数据绑定起来，如何无缝实现数据对各大框架的兼容。就算是已经接入了各大框架，那么每个框架的响应原理不同，我们底层数据响应该如何去做？

庆幸的是，随着vue3的出现，好像给我们提供了一个希望。我们考虑将 [@vue/reactivity](https://www.npmjs.com/@vue/reactivity) 作为底层数据响应，通过桥接方式对各大框架进行`forceUpdate`的任务调度。而在vue3内部则天然支持，无需做更多的调度。这样的方式浑然天成。不论是`react`或者`preact`都可以完美接受。

只要是响应式框架，那么必定有任务调度机制，通过他们自身的任务调度，就一定可以结合vue3的reactivity特性对数据进行响应。

在react中，我们采用

```ts
const [, forUpdate] = useReducer(s => s + 1, []);
```

这样的方式获取到`forceUpdate`函数进行响应。而`@vue/reactivity`中使用

```ts
const effection = effect(() => {})
```

对响应数据的依赖进行收集后供`forceUpdate`来调度。这同时给react提供了一种非常便捷的数据修改方式，再也不需要使用`dispatch`来更新数据。唯一的缺点就是我们需要在`effect`函数中尽可能精确的收集依赖来保证数据的同步响应，特别是对数组的操作。

### 百万路由设计

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

### Component调用iOC服务

一般的，在各大框架中，组件是独立的存在，但是我们基于iOC原则做服务功能的划分的时候，如何有效接入组件中使用，我们提出一个概念叫`iOCComponent`，这是一种新组件概念。

```tsx
@Component()
class NewComponent {
  @inject(AnyService) private readonly AnyService: AnyService;
  render() {
    this.AnyService.xxx();
    // return tsx
  }
}
```

当然为来解决组件缓存问题，我们已经设计过这样的模式来获取

```ts
const Cmp = this.NewComponent.render;
// ...
return <Cmp />
```

## 如何使用

框架使用具备一定的难度，上手成本较高，所以我们提供来模板供大家使用。

### 模板化

React端：

```bash
$ git clone git@github.com:flowxjs/TypeClientReactTemplate.git
$ cd TypeClientReactTemplate
$ rm -rf .git
$ npm ci
$ npm start
```

> Vue3暂时不提供。需要等其正式发布后提供

### 自定义

```bash
$ npm i @typeclient/core
$ npm i @typeclient/react
```

> 请参考后续讲解如何搭建自定义的项目