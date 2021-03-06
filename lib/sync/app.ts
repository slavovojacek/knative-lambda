import fastify from 'fastify';
import cors from 'fastify-cors';

import { lambdaHandler } from './lambda';
import type * as types from './types';

export const buildSync = <
  EventSchema extends types.ServeSyncEventSchemaBase,
  RouteSchema extends types.ServeSyncRouteSchemaBase
>(
  handler: types.ServeSyncHandler<EventSchema>,
  schema: RouteSchema,
  options: types.ServeSyncOptions
) => {
  const app = fastify(options.fastify);

  if (options.cors) {
    app.register(cors, options.cors);
  }

  app.route({
    method: options.method,
    url: options.url,
    schema,
    handler: lambdaHandler(handler)
  });

  return app;
};
