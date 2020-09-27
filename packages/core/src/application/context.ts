import mitt from 'mitt';
import { Request } from './request';
import { Application } from './application';
import { reactive, Ref, UnwrapRef, ref } from '@vue/reactivity';

type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRef<T>;
let index = 0;

export class Context<T extends object = {}> {
  public readonly req: Request;
  public readonly app: Application<any>;
  public readonly state: UnwrapNestedRefs<T>;
  public readonly query: Record<string, string>;
  public readonly params: Record<string, string>;
  public readonly id: number;
  public readonly $e = mitt();
  public readonly self = this;
  public error: Ref<any> = ref(null);
  public status: Ref<100 | 200 | 500 | 900 | 302> = ref(100);
  private readonly rejections: ((e?: any) => void)[] = [];
  public readonly callbacks: (() => void)[] = [];

  constructor(app: Application<any>, req: Request, data: T) {
    this.app = app;
    this.req = req;
    this.state = reactive(data);
    this.query = this.req.query;
    this.params = this.req.params;
    this.id = index++;
    this.onHashAnchor();
  }

  private onHashAnchor() {
    this.$e.on('context.create', () => {
      const hash = this.req.hash;
      if (hash) {
        const id = hash.substring(1);
        if (id) {
          this.app.nextTick(null, () => {
            const el = document.getElementById(id);
            if (el) {
              if (!this.app.has('Application.onHashAnchorChange')) return el.scrollIntoView({
                behavior: 'smooth',
              });
              this.app.trigger('Application.onHashAnchorChange', el);
            }
          })
        }
      }
    })
  }

  public useReject(reject: (e?: any) => void) {
    this.rejections.push(reject);
    return () => {
      const index = this.rejections.indexOf(reject);
      if (index > -1) this.rejections.splice(index, 1);
    }
  }

  public destroy() {
    const rejections = this.rejections.slice(0);
    this.status.value = 900;
    this.rejections.length = 0;
    let i = rejections.length;
    while (i--) rejections[i]();
    this.$e.emit('context.destroy');
  }

  public readonly redirect = (url: string, title?: string) => {
    if (this.status.value === 100) {
      this.status.value = 302;
      throw () => this.app.redirect(url, title);
    } else {
      this.app.redirect(url, title);
    }
  }

  public readonly replace = (url: string, title?: string) => {
    if (this.status.value === 100) {
      this.status.value = 302;
      throw () => this.app.replace(url, title);
    } else {
      this.app.replace(url, title);
    }
  }

  public readonly reload = () => {
    if (this.status.value === 100) {
      this.status.value = 302;
      throw () => this.app.reload();
    } else {
      this.app.reload();
    }
  }

  public readonly useEffect = (callback: () => (() => void) | void) => {
    const handler = () => {
      const unMount = callback();
      if (typeof unMount === 'function') {
        return this.$e.on('context.destroy', unMount);
      }
    }
    this.$e.on('context.create', handler);
    return () => this.$e.off('context.create', handler);
  }
}