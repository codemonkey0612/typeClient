# `axios`

> TODO: description

## Usage

```typescript
import Axios from 'axios';
import { injectable, inject } from 'inversify';
import { TypeAxios } from '@typeclient/axios';
import { Context } from '@typeclient/core';

@injectable()
class Axios extends TypeAxios {
  constructor() {
    const ajax = Axios.create({
      baseUrl: '...'
    })
  }
}

@injectable()
class ZController {
  @inject(Axios) private readonly Axios: Axios;

  test(ctx: Context) {
    return this.Axios.get(ctx, '...');
  }
}
```