import Ajv, { type AnySchema, type Options as AjvOptions } from 'ajv';
import { type CloudEvent, HTTP } from 'cloudevents';
import { type RouteHandlerMethod } from 'fastify';

import { HandlerExecutionError } from '../error';
import type * as types from './types';

export const lambdaHandler = <T>(
  handler: types.ServeAsyncHandler<T>,
  schema: AnySchema,
  options?: types.ServeAsyncOptions
): RouteHandlerMethod => {
  const validateCloudEvent = cloudEventValidator<T>(schema, options?.ajv);

  return async (req, res) => {
    const reply = (status: number, message?: string, error?: unknown) => {
      if (error) req.log.error(error, message);
      res.status(status).send(message);
    };

    try {
      const cloudEvent = HTTP.toEvent(req) as CloudEvent<unknown>;

      try {
        const event = validateCloudEvent(cloudEvent);

        try {
          await handler(event);
          return reply(202);
        } catch (error) {
          if (error instanceof HandlerExecutionError) {
            return reply(error.detail.statusCode, error.detail.text, error);
          }

          return reply(500, 'Internal failure', error);
        }
      } catch (error) {
        return reply(400, 'Invalid cloud event data', error);
      }
    } catch (error) {
      return reply(400, 'Invalid cloud event', error);
    }
  };
};

const cloudEventValidator = <T>(schema: AnySchema, ajvOptions?: AjvOptions) => {
  const ajv = new Ajv(ajvOptions);

  return (cloudEvent: CloudEvent<unknown>): types.ServeAsyncHandlerEvent<T> => {
    const isValid = ajv.validate(schema, cloudEvent.data);

    if (!isValid) {
      const err = new Error('data validation error');
      // See https://github.com/ajv-validator/ajv/blob/master/docs/faq.md#ajv-api-for-returning-validation-errors
      Object.assign(err, { validationErrors: ajv.errors });
      throw err;
    }

    return cloudEvent as types.ServeAsyncHandlerEvent<T>;
  };
};
