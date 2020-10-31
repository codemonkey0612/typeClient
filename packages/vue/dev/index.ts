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
      return h('div', null, [
        h('p', null, 'hello'),
        context.slots.default(),
      ])
    }
  }
}

@Component()
class ZZZ implements ComponentTransform {
  setup(props: unknown, context: SetupContext) {
    return () => {
      return h('div', null, 'my name is evio')
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
      onClick: () => ctx.redirect('/test'),
    }, ['world', h(Z)])
  }

  @Route('/test')
  go() {
    const ctx = useApplicationContext();
    return () => h('div', {
      onClick: () => ctx.redirect('/'),
    }, 'test');
  }
}

app.setController(test);

bootstrp();

// import { createApp, defineComponent, h, inject, provide } from 'vue';
// const a = Symbol();
// const aa = defineComponent((props: { a: number }, ctx) => {
//   return () => h('div', null, 'rrr')
// })
// const bb = defineComponent({
//   setup() {
//     const v = inject(a);
    
//     return function() {
//       return h('div', null, 'eee' + v)
//     }
//   }
// })

// const app = defineComponent({
//   name: 'xxx',
//   setup() {
//     provide(a, 123);
//     return () => h('div', null, ['jee', h(aa, { a: 123 }), h(bb)])
//   }
// });

// createApp(app).mount('#app');