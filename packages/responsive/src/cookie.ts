import { Responsive } from './responsive';
export interface TCookieAttributes {
  /**
   * Define when the cookie will be removed. Value can be a Number
   * which will be interpreted as days from time of creation or a
   * Date instance. If omitted, the cookie becomes a session cookie.
   */
  expires?: number | Date | string;

  /**
   * Define the path where the cookie is available. Defaults to '/'
   */
  path?: string;

  /**
   * Define the domain where the cookie is available. Defaults to
   * the domain of the page where the cookie was created.
   */
  domain?: string;

  /**
   * A Boolean indicating if the cookie transmission requires a
   * secure protocol (https). Defaults to false.
   */
  secure?: boolean;

  /**
   * Asserts that a cookie must not be sent with cross-origin requests,
   * providing some protection against cross-site request forgery
   * attacks (CSRF)
   */
  sameSite?: 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None';

  /**
   * An attribute which will be serialized, conformably to RFC 6265
   * section 5.2.
   */
  [property: string]: any;
}
export function getCookies() {
  if (typeof document === 'undefined') throw new Error('Not support document.cookie');
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  const jar: { [key: string]: string } = {};
  for (let i = 0; i < cookies.length; i++) {
    const parts = cookies[i].split('=');
    const value = parts.slice(1).join('=');
    const foundKey = read(parts[0]);
    jar[foundKey] = read(value);
  }
  return jar;
}

export function Cookie(options: TCookieAttributes = { path: '/' }) {
  const convert = {
    get: getCookies,
    set(key: string, value: string, attributes: TCookieAttributes = { path: '/' }) {
      if (typeof document === 'undefined') throw new Error('Not support document.cookie');
      attributes = Object.assign({}, { path: '/' }, options);
      if (typeof attributes.expires === 'number') {
        attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
      } else if (typeof attributes.expires === 'string') {
        attributes.expires = new Date(attributes.expires);
      }
      if (attributes.expires) {
        attributes.expires = attributes.expires.toUTCString();
      }
      key = write(key);
      value = write(value);

      let stringifiedAttributes = '';
      for (var attributeName in attributes) {
        if (!attributes[attributeName]) {
          continue;
        }

        stringifiedAttributes += '; ' + attributeName

        if (attributes[attributeName] === true) {
          continue;
        }

        stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
      }
      return (document.cookie = key + '=' + value + stringifiedAttributes);
    },
    delete(key: string){
      return this.set(key, '', Object.assign({}, options, {
        expires: -1
      }));
    }
  }
  return Responsive(convert);
}

function read(value: string) {
  return value.replace(/%3B/g, ';').replace(/%3D/g, '=');
}

function write(value: string) {
  return value.replace(/;/g, '%3B').replace(/=/g, '%3D');
}