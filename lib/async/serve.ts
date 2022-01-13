import { get } from 'env-var';

import { build } from './serve.app';

export const serve = (...params: Parameters<typeof build>) => {
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
