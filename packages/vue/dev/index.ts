import { bootstrp, Controller, inject, Route } from '@typeclient/core';
import { h, onMounted, onUnmounted, SetupContext } from 'vue';
import { useApplicationContext, VueApplication } from '../src';
import { Component, ComponentTransform, Template, useComponent } from '../src/annotations';

@Component()
class Templates implements ComponentTransform {
  setup(props: unknown, context: SetupContext) {
    onMounted(() => console.log('template mounted'));
    onUnmounted(() => console.log('template unmounted'))
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
  page() {
    const ctx = useApplicationContext();
    const Z = useComponent(this.z)
    return () => h('div', {
      onClick: () => ctx.value.redirect('/test/1'),
    }, {
      default: () => ['world', h(Z)]
    })
  }

  @Route('/test/:id(\\d+)')
  go() {
    const ctx = useApplicationContext();
    return () => h('div', {
      onClick: () => ctx.value.redirect('/test/' + (Number(ctx.params.id) + 1)),
    }, {
      default: () => ['test', h('span', null, ctx.params.id)]
    });
  }
}

app.setController(test);

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