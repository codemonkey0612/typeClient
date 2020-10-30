type THistoryStack = (u: string) => void;
interface THistory {
  mode: 'hashchange' | 'popstate',
  stacks: THistoryStack[],
  listener: typeof invoke,
}

const History: THistory = {
  mode: 'hashchange',
  stacks: [],
  listener: invoke,
}

window.addEventListener(History.mode, invoke);

export function unSubscribe() {
  if (History.listener) {
    window.removeEventListener(History.mode, History.listener);
    History.listener = null;
  }
}

export function useHistoryFeedback(callback: THistoryStack) {
  History.stacks.push(callback);
  return () => {
    const i = History.stacks.indexOf(callback);
    if (i > -1) {
      History.stacks.splice(i, 1);
    }
  }
}

export function usePopStateHistoryMode() {
  let mode: (typeof History)['mode'] = 'popstate';
  if (!window.history.pushState || window.location.protocol.toLowerCase().indexOf('file:') === 0) {
    console.warn('Browser does not support `popstate` mode, change it to `hashchange` instead.');
    mode = 'hashchange';
  }
  if (History.mode !== mode) {
    unSubscribe();
    window.addEventListener(History.mode = mode, invoke);
    History.listener = invoke;
  }
}

export function invoke() {
  const url = History.listener ? getUrlByLocation() : '/';
  let i = History.stacks.length;
  while (i--) History.stacks[i](url);
}

function getUrlByLocation() {
  if (History.mode === 'hashchange') {
    return window.location.hash.replace(/^\#/, '') || '/';
  }
  const location = window.location;
  return location.pathname + location.search + location.hash;
}

export const bootstrp = invoke;

export function redirect(url: string, title: string = window.document.title) {
  if (History.mode === 'popstate') {
    window.history.pushState(null, title, url);
    return invoke();
  }
  window.location.hash = url;
  window.document.title = title;
}

export function replace(url: string, title: string = window.document.title) {
  if (History.mode === 'popstate') {
    window.history.replaceState(null, title, url);
    return invoke();
  }
  const i = window.location.href.indexOf('#');
  window.location.replace(
    window.location.href.slice(0, i >= 0 ? i : 0) + '#' + url
  );
  window.document.title = title;
}

export const reload = invoke;