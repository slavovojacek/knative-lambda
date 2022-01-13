import { type Options as AjvOptions } from 'ajv';
import { type CloudEvent } from 'cloudevents';
import { type FastifyServerOptions } from 'fastify';

export type AsyncServeHandlerEvent<T> = CloudEvent<T> & {
  data: T;
};

export type AsyncServeHandler<T> = (
  event: AsyncServeHandlerEvent<T>,
  context?: unknown
) => void | Promise<void>;

export type AsyncServeOptions = Partial<{
  fastify: FastifyServerOptions;
  ajv: AjvOptions;
}>;
