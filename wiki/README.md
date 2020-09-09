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

:::warning
该架构具备一定的上手难度，需要开发者了解以上的三个概念后才能理解架构的意义。建议可以优先通过以下资料来理解基础概念:

- [inversify](https://npmjs.com/inversify)
- [reflect-metadata](https://www.npmjs.com/package/reflect-metadata)
- [koa-compose](https://www.npmjs.com/package/koa-compose)
:::

<iframe src="https://codesandbox.io/embed/github/flowxjs/TypeClientReactTemplate/tree/master/?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="flowxjs/TypeClientReactTemplate"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>



### Repositories

- [TypeClient](https://github.com/flowxjs/TypeClient) 核心架构仓库
- [TypeClientReactTemplate](https://github.com/flowxjs/TypeClientReactTemplate) react项目模板仓库

> `Vue`驱动与模板仓库将在 [Vue3](https://v3.vuejs.org) 正式版发布之后开源。

### Modules

1. <input type="checkbox" checked disabled /> **@typeclient/core** 核心模块
1. <input type="checkbox" checked disabled /> **@typeclient/react** react支持的驱动
1. <input type="checkbox" disabled /> **@typeclient/vue** vue支持的驱动
1. <input type="checkbox" checked disabled /> **@typeclient/axios** axios请求支持
1. <input type="checkbox" checked disabled /> **@typeclient/responsive** 持久化存储支持 `localStorage` `sessionStorage` and `cookie`