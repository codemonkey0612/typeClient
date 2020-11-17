import { TAnnotationScanerMethod } from '../annotation';
import { Context } from './context';

export interface TApplicationLifeCycles<T> {
  applicationInitialize?(next: () => void): void;
  applicationComponentRender<C extends Context = Context>(context: C, server: any, key: string, meta: TAnnotationScanerMethod): void;
  applicationErrorRender(virtualNode: T): void;
}