import Url from 'url-parse';

export class Request extends Url {
  public params: Record<string, string> = {};
  // request method using 'GET' by default
  public readonly method = 'GET';

  constructor(url: string) {
    super(url, true);
  }
}