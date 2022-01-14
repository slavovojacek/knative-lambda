import { get } from 'env-var';
import { type FastifyInstance } from 'fastify';

import { buildSync } from './sync/app';
import { buildAsync } from './async/app';

export const serveSync = (...params: Parameters<typeof buildSync>) => serve(buildSync, ...params);

export const serveAsync = (...params: Parameters<typeof buildAsync>) =>
  serve(buildAsync, ...params);

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
