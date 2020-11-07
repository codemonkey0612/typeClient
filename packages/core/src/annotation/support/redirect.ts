import { Action } from './action';
import { Context } from "../../application/context";

export function Redirect(url?: string) {
  return Action(async (ctx: Context<any>, data?: string | { url: string }) => {
    let redirectURL: string;
    if (!data) {
      redirectURL = url;
    } else {
      if (typeof data === 'string') {
        redirectURL = data;
      } else {
        redirectURL = data.url;
      }
    }
    if (redirectURL) {
      ctx.replace(redirectURL);
    } else {
      throw new Error('Redirection Function must return a value of string.');
    }
  });
}