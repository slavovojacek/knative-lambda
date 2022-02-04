import { type AnySchema } from 'ajv';
import { get } from 'env-var';
import { type FastifyInstance } from 'fastify';

import { buildSync } from './sync/app';
import type * as syncTypes from './sync/types';
import { buildAsync } from './async/app';
import type * as asyncTypes from './async/types';

export const serveSync = async <
  EventSchema extends syncTypes.ServeSyncEventSchemaBase,
  RouteSchema extends syncTypes.ServeSyncRouteSchemaBase
>(
  handler: syncTypes.ServeSyncHandler<EventSchema>,
  schema: RouteSchema,
  options: syncTypes.ServeSyncOptions
) => {
  const server = buildSync(handler, schema, options);
  return await serve(server, options);
};

export const serveAsync = async <T>(
  handler: asyncTypes.ServeAsyncHandler<T>,
  schema: AnySchema,
  options?: asyncTypes.ServeAsyncOptions
) => {
  const server = buildAsync(handler, schema, options);
  return await serve(server, options);
};

const serve = async (
  server: FastifyInstance,
  options?: syncTypes.ServeSyncOptions | asyncTypes.ServeAsyncOptions
) => {
  const port = options?.port ?? get('PORT').required().asInt();

  const start = async () => {
    try {
      if (options?.onStart) {
        server.log.info('performing prerequisite setup');
        await options.onStart();
      }

      server.log.info('starting server');
      await server.listen(port);
    } catch (error) {
      server.log.error(error);
      process.exit(1);
    }
  };

  const stop = async () => {
    try {
      server.log.info('stopping server');
      await server.close();

      if (options?.onStop) {
        server.log.info('performing cleanup');
        await options.onStop();
      }

      process.exit(0);
    } catch (error) {
      server.log.error(error);
      process.exit(1);
    }
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.once(signal, stop);
  });

  await start();

  return stop;
};
