import Ajv, { type AnySchema, type Options as AjvOptions } from 'ajv';
import { type CloudEvent, HTTP } from 'cloudevents';
import { type RouteHandlerMethod } from 'fastify';

import { type AsyncServeHandler, type AsyncServeHandlerEvent } from './serve.types';

export const lambdaHandler = <T>(
  handler: AsyncServeHandler<T>,
  schema: AnySchema,
  ajvOptions?: AjvOptions
): RouteHandlerMethod => {
  const validateCloudEvent = cloudEventValidator<T>(schema, ajvOptions);

  return async (req, res) => {
    const reply = (status: number, message?: string, error?: unknown) => {
      if (error) req.log.error(error, message);
      res.status(status).send(message);
    };

    try {
      const ce = HTTP.toEvent({ headers: req.headers, body: req.body }) as CloudEvent<unknown>;

      if (ce.datacontenttype !== 'application/json') {
        return reply(415, 'Unsupported media type');
      }

      try {
        const event = validateCloudEvent(ce);

        try {
          await handler(event);
          return reply(202);
        } catch (error) {
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

  return (ce: CloudEvent<unknown>): AsyncServeHandlerEvent<T> => {
    const isValid = ajv.validate(schema, ce.data);

    if (!isValid) {
      const err = new Error('data validation error');
      // See https://github.com/ajv-validator/ajv/blob/master/docs/faq.md#ajv-api-for-returning-validation-errors
      Object.assign(err, { validationErrors: ajv.errors });
      throw err;
    }

    return ce as AsyncServeHandlerEvent<T>;
  };
};
