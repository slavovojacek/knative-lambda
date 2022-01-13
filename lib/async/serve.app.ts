import { type AnySchema } from 'ajv';
import fastify from 'fastify';

import { lambdaHandler } from './serve.lambda';
import { AsyncServeHandler, AsyncServeOptions } from './serve.types';

export const build = <T>(
  handler: AsyncServeHandler<T>,
  schema: AnySchema,
  options?: AsyncServeOptions
) => {
  const app = fastify(options?.fastify);

  app.route({
    method: 'POST',
    url: '/',
    handler: lambdaHandler(handler, schema, options?.ajv)
  });

  return app;
};
