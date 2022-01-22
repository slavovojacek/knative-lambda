import { type RawServerBase } from 'fastify';

import { HandlerExecutionError } from '../error';
import type * as types from './types';

export const lambdaHandler = <
  RawServer extends RawServerBase,
  EventSchema extends types.ServeSyncEventSchemaBase
>(
  handler: types.ServeSyncHandler<EventSchema>
): types.ServeSyncRouteHandlerMethod<RawServer, EventSchema> => {
  return async (req, res) => {
    const event: types.ServeSyncHandlerEvent<EventSchema> = {
      body: req.body,
      querystring: req.query,
      params: req.params,
      headers: req.headers
    };

    try {
      req.log.debug('begin handler execution with event: %o', event);
      const { statusCode, headers = {}, body } = await handler(event);
      return res.code(statusCode).headers(headers).send(body);
    } catch (error) {
      req.log.error(error);
      if (error instanceof HandlerExecutionError) {
        return res.code(error.http.statusCode).send(error.http.text);
      }
      return res.code(500).send('Internal failure');
    } finally {
      req.log.debug('end handler execution');
    }
  };
};
