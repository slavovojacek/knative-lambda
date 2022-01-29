import { type ServeAsyncHandler } from 'knative-lambda';

import type * as schema from './schema';

export const handler: ServeAsyncHandler<schema.Event> = (event) => {
  console.log('hello', event.hello);
};
