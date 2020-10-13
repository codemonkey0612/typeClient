import { Context } from '@typeclient/core';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { injectable, unmanaged } from 'inversify';

type AxiosRequestContextConfig<T extends object = {}> = AxiosRequestConfig & {
  context?: Context<T>
}

@injectable()
export class TypeAxios {
  constructor(@unmanaged() private readonly ajax: AxiosInstance) {}

  public get<T extends object = {}>(url: string, configs: AxiosRequestContextConfig<T> = {}) {
    const ctx = configs.context;
    if (ctx) {
      const source = axios.CancelToken.source();
      const unbind = ctx.self.useReject(source.cancel.bind(source));
      return this.ajax.get(url, Object.assign(configs, {
        cancelToken: source.token,
      })).finally(unbind);
    } else {
      return this.ajax.get(url, configs);
    }
  }

  public post<T extends object = {}>(url: string, data?: any, configs: AxiosRequestContextConfig<T> = {}) {
    const ctx = configs.context;
    if (ctx) {
      const source = axios.CancelToken.source();
      const unbind = ctx.self.useReject(source.cancel.bind(source));
      return this.ajax.post(url, data, Object.assign(configs, {
        cancelToken: source.token,
      })).finally(unbind);
    } else {
      return this.ajax.post(url, data, configs);
    }
  }

  public put<T extends object = {}>(url: string, data?: any, configs: AxiosRequestContextConfig<T> = {}) {
    const ctx = configs.context;
    if (ctx) {
      const source = axios.CancelToken.source();
      const unbind = ctx.self.useReject(source.cancel.bind(source));
      return this.ajax.put(url, data, Object.assign(configs, {
        cancelToken: source.token,
      })).finally(unbind);
    } else {
      return this.ajax.put(url, data, configs);
    }
  }

  public delete<T extends object = {}>(url: string, configs: AxiosRequestContextConfig<T> = {}) {
    const ctx = configs.context;
    if (ctx) {
      const source = axios.CancelToken.source();
      const unbind = ctx.self.useReject(source.cancel.bind(source));
      return this.ajax.delete(url, Object.assign(configs, {
        cancelToken: source.token,
      })).finally(unbind);
    } else {
      return this.ajax.delete(url, configs);
    }
  }

  public request<T extends object = {}>(configs: AxiosRequestContextConfig<T> = {}) {
    const ctx = configs.context;
    if (ctx) {
      const source = axios.CancelToken.source();
      const unbind = ctx.self.useReject(source.cancel.bind(source));
      return this.ajax(Object.assign(configs, {
        cancelToken: source.token,
      })).finally(unbind);
    } else {
      return this.ajax(configs);
    }
  }

  public head<T extends object = {}>(url: string, configs: AxiosRequestContextConfig<T> = {}) {
    const ctx = configs.context;
    if (ctx) {
      const source = axios.CancelToken.source();
      const unbind = ctx.self.useReject(source.cancel.bind(source));
      return this.ajax.head(url, Object.assign(configs, {
        cancelToken: source.token,
      })).finally(unbind);
    } else {
      return this.ajax.head(url, configs);
    }
  }

  public options<T extends object = {}>(url: string, configs: AxiosRequestContextConfig<T> = {}) {
    const ctx = configs.context;
    if (ctx) {
      const source = axios.CancelToken.source();
      const unbind = ctx.self.useReject(source.cancel.bind(source));
      return this.ajax.options(url, Object.assign(configs, {
        cancelToken: source.token,
      })).finally(unbind);
    } else {
      return this.ajax.options(url, configs);
    }
  }

  public pactch<T extends object = {}>(url: string, data?: any, configs: AxiosRequestContextConfig<T> = {}) {
    const ctx = configs.context;
    if (ctx) {
      const source = axios.CancelToken.source();
      const unbind = ctx.self.useReject(source.cancel.bind(source));
      return this.ajax.patch(url, data, Object.assign(configs, {
        cancelToken: source.token,
      })).finally(unbind);
    } else {
      return this.ajax.patch(url, data, configs);
    }
  }
}