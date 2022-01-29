## Async handlers

1. Define a schema:

```ts
// schema.ts

export const event = {
  type: 'object',
  properties: {
    hello: { type: 'string' }
  },
  required: ['hello']
};

export type Event = { hello: string };
```

2. Write a handler:

```ts
// handler.ts
import { type ServeAsyncHandler } from 'knative-lambda';

import type * as schema from './schema';

export const handler: ServeAsyncHandler<schema.Event> = (event) => {
  console.log('hello', event.hello);
};
```

3. Serve:

```ts
// index.ts

import { serveAsync } from 'knative-lambda';

import * as schema from './schema';
import { handler } from './handler';

export default serveAsync(handler, schema.event);
```

## Sync handlers

1. Define a schema:

```ts
// schema.ts

const body = {
  type: 'object',
  properties: {
    hello: { type: 'string' }
  },
  required: ['hello']
};

type Body = { hello: string };

export const event = { body };

export type Event = { Body: Body };
```

2. Write a handler:

```ts
// handler.ts

import { type ServeSyncHandler } from 'knative-lambda';

import type * as schema from './schema';

export const handler: ServeSyncHandler<schema.Event> = (event) => {
  console.log('hello', event.body.hello);
};
```

3. Serve:

```ts
// index.ts

import { serveSync } from 'knative-lambda';

import * as schema from './schema';
import { handler } from './handler';

export default serveSync(handler, schema.event, { method: 'POST', url: '/' });
```
