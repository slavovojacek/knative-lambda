import { type AnySchema } from 'ajv';
import type * as fastify from 'fastify';
import { type OutgoingHttpHeaders } from 'http';

export type ServeSyncEventSchemaBase = Partial<{
  Body: unknown;
  Querystring: unknown;
  Params: unknown;
  Headers: unknown;
  Reply: unknown;
}>;

export type ServeSyncRouteSchemaBase = Partial<{
  body: AnySchema;
  querystring: AnySchema;
  params: AnySchema;
  headers: AnySchema;
  reply: AnySchema;
}>;

export type ServeSyncRouteHandlerMethod<
  RawServer extends fastify.RawServerBase,
  EventSchema extends ServeSyncEventSchemaBase
> = fastify.RouteHandlerMethod<
  RawServer,
  fastify.RawRequestDefaultExpression<RawServer>,
  fastify.RawReplyDefaultExpression<RawServer>,
  EventSchema
>;

export type ServeSyncHandlerEvent<EventSchema extends ServeSyncEventSchemaBase> = {
  body: EventSchema['Body'];
  querystring: EventSchema['Querystring'];
  params: EventSchema['Params'];
  headers: EventSchema['Headers'];
};

export type ServeSyncHandlerResponse<EventSchema extends ServeSyncEventSchemaBase> = {
  statusCode: number;
  headers?: OutgoingHttpHeaders;
  body?: EventSchema['Reply'];
};

export type ServeSyncHandler<EventSchema extends ServeSyncEventSchemaBase> = (
  event: ServeSyncHandlerEvent<EventSchema>,
  context?: unknown
) => ServeSyncHandlerResponse<EventSchema> | Promise<ServeSyncHandlerResponse<EventSchema>>;

export type ServeSyncOptions = {
  fastify?: fastify.FastifyServerOptions;
  method: fastify.HTTPMethods;
  url: string;
};
