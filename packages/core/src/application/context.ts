import { Request } from './request';
import { Application } from './application';
import { ContextEventEmitter } from './events';
import { TApplicationContextLifeCycle } from './lifecycle';
import { reactive, Ref, UnwrapRef, ref } from '@vue/reactivity';

type UnwrapNestedRefs<T> = T extends Ref ? T : UnwrapRef<T>;
let index = 0;

export class Context<T extends object = {}> extends ContextEventEmitter<TApplicationContextLifeCycle> {
  public readonly req: Request;
  public readonly app: Application<any>;
  public readonly state: UnwrapNestedRefs<T>;
  public readonly query: { [key: string]: string };
  public readonly params: { [key: string]: string };
  public readonly key: number;
  
  public status: Ref<100 | 200 | 500 | 900> = ref(100);
  private readonly rejections: ((e?: any) => void)[] = [];

  constructor(app: Application<any>, req: Request, data: T) {
    super();
    this.app = app;
    this.req = req;
    this.state = reactive(data);
    this.query = this.req.query;
    this.params = this.req.params;
    this.key = index++;
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
  }

  public readonly redirect = (url: string, title?: string) => {
    return this.app.redirect(url, title);
  }

  public readonly replace = (url: string, title?: string) => {
    return this.app.replace(url, title);
  }

  public readonly reload = () => this.app.reload();
}