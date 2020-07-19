import { Context } from "./context";
import { TAnnotationScanerMethod } from "../annotation";
import { Request } from './request';

export type TApplicationLifeCycle = {
  'Application.onError': {
    arguments: [Error, Context],
    return: void
  },
  'Application.onNotFound': {
    arguments: [Request],
    return: void
  },
  'Application.onInit': {
    arguments: [() => void],
    return: void,
  },
  'Application.onRender': {
    arguments: [Context, any, string, TAnnotationScanerMethod],
    return: any,
  },
  'Application.onErrorRender': {
    arguments: [any],
    return: void
  }
}