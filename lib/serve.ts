import { type AnySchema } from 'ajv';
import { get } from 'env-var';
import { type FastifyInstance } from 'fastify';

import { buildSync } from './sync/app';
import type * as syncTypes from './sync/types';
import { buildAsync } from './async/app';
import type * as asyncTypes from './async/types';

export const serveSync = <
  EventSchema extends syncTypes.ServeSyncEventSchemaBase,
  RouteSchema extends syncTypes.ServeSyncRouteSchemaBase
>(
  handler: syncTypes.ServeSyncHandler<EventSchema>,
  schema: RouteSchema,
  options: syncTypes.ServeSyncOptions
) => serve(buildSync, handler, schema, options);

export const serveAsync = <T>(
  handler: asyncTypes.ServeAsyncHandler<T>,
  schema: AnySchema,
  options?: asyncTypes.ServeAsyncOptions
) => serve(buildAsync, handler, schema, options);

const serve = <Params extends Array<unknown>>(
  build: (...params: Params) => FastifyInstance,
  ...params: Params
) => {
  const port = get('PORT').required().asInt();

  const server = build(...params);

  const start = async () => {
    server.log.info('starting server');

    try {
      await server.listen(port);
    } catch (error) {
      server.log.error(error);
      process.exit(1);
    }
  };

  const stop = async () => {
    server.log.info('stopping server');

    try {
      await server.close();
      process.exit(0);
    } catch (error) {
      server.log.error(error);
      process.exit(1);
    }
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.once(signal, stop);
  });

  start();
};
