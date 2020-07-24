import { Context } from "./context";
import { TAnnotationScanerMethod } from "../annotation";
import { Request } from './request';

export type TApplicationLifeCycle = {
  'Application.onError': {
    arguments: [Error, Context],
    return: any
  },
  'Application.onNotFound': {
    arguments: [Request],
    return: any
  },
  'Application.onInit': {
    arguments: [() => void],
    return: void,
  },
  'Application.onRender': {
    arguments: [Context, any, string, TAnnotationScanerMethod],
    return: void,
  },
  'Application.onErrorRender': {
    arguments: [any],
    return: void
  }
}