import { type AnySchema } from 'ajv';
import fastify from 'fastify';

import { lambdaHandler } from './lambda';
import type * as types from './types';

export const buildAsync = <T>(
  handler: types.ServeAsyncHandler<T>,
  schema: AnySchema,
  options?: types.ServeAsyncOptions
) => {
  const app = fastify(options?.fastify);

  app.route({
    method: 'POST',
    url: '/',
    handler: lambdaHandler(handler, schema, options?.ajv)
  });

  return app;
};
