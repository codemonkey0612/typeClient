import { bootstrp, ComposeNextCallback, Context, Controller, inject, Middleware, MiddlewareTransform, Route, State, useMiddleware } from '@typeclient/core';
import { h, onMounted, onUnmounted, SetupContext } from 'vue';
import { TReactiveContext, TReactiveContextProps, useApplicationContext, useContextEffect, VueApplication } from '../src';
import { Component, ComponentTransform, Template, TemplateTransform, useComponent } from '../src/annotations';

@Middleware()
class m implements MiddlewareTransform<Context> {
  async use(ctx: Context<TCount>, next: ComposeNextCallback) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    ctx.state.count++;
    await next();
  }
}

@Component()
class Templates implements TemplateTransform {
  setup(props: TReactiveContextProps, context: SetupContext) {
    // onMounted(() => console.log('template mounted'));
    // onUnmounted(() => console.log('template unmounted'))
    return () => {
      return h('div', null, {
        default: () => [
          h('p', null, {
            default: () => ['hello']
          }),
          context.slots.default && context.slots.default()
        ]
      })
    }
  }
}

@Component()
class ZZZ implements ComponentTransform {
  setup(props: unknown, context: SetupContext) {
    return () => {
      return h('div', null, {
        default: () => ['my name is evio']
      })
    }
  }
}

const app = new VueApplication({
  el: document.getElementById('app'),
  prefix: '/',
});

@Controller()
@Template(Templates)
class test {
  @inject(ZZZ) private readonly z: ZZZ;
  @Route()
  page(context: SetupContext) {
    const ctx = useApplicationContext();
    const Z = useComponent(this.z)
    return () => h('div', {
      onClick: () => ctx.value.redirect('/test/1'),
    }, {
      default: () => ['world', h(Z)]
    })
  }

  @Route('/test/:id(\\d+)')
  // @useMiddleware(m)
  @State(Count)
  go(context: SetupContext) {
    const ctx = useApplicationContext<TCount>();
    onMounted(() => console.log('in'))
    onUnmounted(() => console.log('out'))
    // useContextEffect(() => {
    //   console.log('ready');
    //   return () => console.log('destroy')
    // })
    return () => h('div', null, {
      default: () => [
        'test', 
        h('button', {
          onClick() {
            ctx.value.redirect('/test/' + (Number(ctx.params.id) + 1))
          }
        }, 'click'),
        h('span', null, ctx.params.id)
      ]
    });
  }
}

app.setController(test);

app.onError(err => {
  return h('div', null, err.message);
})

bootstrp();

// import { createApp, defineComponent, h, ref, toRaw } from 'vue';
// import { createContext } from '../src';

// const ass = createContext<any>();

// const aa = defineComponent((props, ctx) => {
//   return () => h('div', null, 'rrr')
// })
// const bb = defineComponent({
//   setup() {
//     return function() {
//       return h('div', null, 'eee')
//     }
//   }
// })

// const app = defineComponent({
//   name: 'xxx',
//   setup() {
//     const v = ref<any>(aa);
    
//     return () => {
//       console.log('v:', v.value)
//       const children = h(v.value);
//       return h('div', null, h(ass.Provider, null, [h('p', null, 'jee'), h('button', {
//         onClick() {
//           v.value = toRaw(v.value) === aa ? bb : aa;
//         }
//       }, 'click'), children]))
//     }
//   }
// });

// createApp(app).mount('#app');
type TCount = { count: number, }
function Count(): TCount {
  return {
    count: 0,
  }
}