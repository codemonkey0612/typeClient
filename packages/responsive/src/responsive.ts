import { reactive, ReactiveEffect, effect } from '@vue/reactivity';

export interface TResponsiveConverter {
  get(): { [key: string]: any },
  set(key: string, value: any): void,
  delete(key: string): void,
}

export function Responsive(converter: TResponsiveConverter) {
  const effects = new Map<string, ReactiveEffect>();
  const data = converter.get();
  const keys = Object.keys(data);
  const reactiveData = reactive(data);
  keys.forEach(createTask);

  return new Proxy(reactiveData, {
    get: (target, property: string) => target[property],
    set: (target, property: string, value) => {
      const exists = Reflect.has(target, property);
      target[property] = value;
      if (!exists) createTask(property);
      return true;
    },
    defineProperty: (target, property: string) => {
      const exists = effects.has(property);
      if (exists) {
        const stop = effects.get(property);
        stop();
      }
      return Reflect.deleteProperty(target, property);
    }
  });

  function createTask(key: string) {
    return effects.set(key, effect(() => {
      const value = reactiveData[key];
      if (value === undefined) return converter.delete(key);
      return converter.set(key, value);
    }));
  }
}