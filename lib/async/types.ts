import { type Options as AjvOptions } from 'ajv';
import { type CloudEvent } from 'cloudevents';
import { type FastifyServerOptions } from 'fastify';

export type ServeAsyncHandlerEvent<T> = CloudEvent<T> & {
  data: T;
};

export type ServeAsyncHandler<T> = (
  event: ServeAsyncHandlerEvent<T>,
  context?: unknown
) => void | Promise<void>;

export type ServeAsyncOptions = Partial<{
  fastify: FastifyServerOptions;
  ajv: AjvOptions;
}>;
