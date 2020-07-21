import { Context } from '@typeclient/core';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class TypeAxios {
  constructor(private readonly ajax: AxiosInstance) {}

  public get<T extends object = {}>(ctx: Context<T>, url: string, configs: AxiosRequestConfig = {}) {
    const source = axios.CancelToken.source();
    const unbind = ctx.useReject(source.cancel.bind(source));
    return this.ajax.get(url, Object.assign(configs, {
      cancelToken: source.token,
    })).finally(unbind);
  }

  public post<T extends object = {}>(ctx: Context<T>, url: string, data?: any, configs: AxiosRequestConfig = {}) {
    const source = axios.CancelToken.source();
    const unbind = ctx.useReject(source.cancel.bind(source));
    return this.ajax.post(url, data, Object.assign(configs, {
      cancelToken: source.token,
    })).finally(unbind);
  }

  public put<T extends object = {}>(ctx: Context<T>, url: string, data?: any, configs: AxiosRequestConfig = {}) {
    const source = axios.CancelToken.source();
    const unbind = ctx.useReject(source.cancel.bind(source));
    return this.ajax.put(url, data, Object.assign(configs, {
      cancelToken: source.token,
    })).finally(unbind);
  }

  public delete<T extends object = {}>(ctx: Context<T>, url: string, configs: AxiosRequestConfig = {}) {
    const source = axios.CancelToken.source();
    const unbind = ctx.useReject(source.cancel.bind(source));
    return this.ajax.delete(url, Object.assign(configs, {
      cancelToken: source.token,
    })).finally(unbind);
  }

  public request<T extends object = {}>(ctx: Context<T>, configs: AxiosRequestConfig = {}) {
    const source = axios.CancelToken.source();
    const unbind = ctx.useReject(source.cancel.bind(source));
    return this.ajax(Object.assign(configs, {
      cancelToken: source.token,
    })).finally(unbind);
  }

  public head<T extends object = {}>(ctx: Context<T>, url: string, configs: AxiosRequestConfig = {}) {
    const source = axios.CancelToken.source();
    const unbind = ctx.useReject(source.cancel.bind(source));
    return this.ajax.head(url, Object.assign(configs, {
      cancelToken: source.token,
    })).finally(unbind);
  }

  public options<T extends object = {}>(ctx: Context<T>, url: string, configs: AxiosRequestConfig = {}) {
    const source = axios.CancelToken.source();
    const unbind = ctx.useReject(source.cancel.bind(source));
    return this.ajax.options(url, Object.assign(configs, {
      cancelToken: source.token,
    })).finally(unbind);
  }

  public pactch<T extends object = {}>(ctx: Context<T>, url: string, data?: any, configs: AxiosRequestConfig = {}) {
    const source = axios.CancelToken.source();
    const unbind = ctx.useReject(source.cancel.bind(source));
    return this.ajax.patch(url, data, Object.assign(configs, {
      cancelToken: source.token,
    })).finally(unbind);
  }
}