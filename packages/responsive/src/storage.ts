import { Responsive } from "./responsive";

export function Storage(type: 'LocalStorage' | 'SessionStorage' = 'LocalStorage') {
  const storage = type === 'LocalStorage' ? window.localStorage : window.sessionStorage;
  return Responsive({
    get() {
      const jar: { [key: string]: string } = {};
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        jar[key] = storage.getItem(key);
      }
      return jar;
    },
    set(key: string, value: string) {
      return storage.setItem(key, value);
    },
    delete(key: string) {
      return storage.removeItem(key);
    }
  });
}