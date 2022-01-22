import test from 'ava';
import { CloudEvent, HTTP } from 'cloudevents';

import { buildAsync } from '../lib/async/app';
import { type ServeAsyncHandler } from '../lib/async/types';
import { HandlerExecutionError } from '../lib/error';

test('processes valid cloud event', async (t) => {
  type Schema = { hello: string };

  const ce = new CloudEvent<Schema>({
    id: 'foo',
    source: 'urn:sources:test',
    type: 'urn:events:test-event',
    datacontenttype: 'application/json',
    data: { hello: 'John' }
  });

  t.plan(2);

  const handler: ServeAsyncHandler<Schema> = (event) => {
    t.is(event.data.hello, 'John');
  };

  const schema = {
    type: 'object',
    properties: {
      hello: { type: 'string' }
    },
    required: ['hello']
  };

  const app = buildAsync(handler, schema);

  const response = await app.inject({
    method: 'POST',
    url: '/',
    ...HTTP.binary(ce)
  });

  t.is(response.statusCode, 202);
});

test('rejects cloud event with invalid data', async (t) => {
  const invalidCe = new CloudEvent({
    id: 'foo',
    source: 'urn:sources:test',
    type: 'urn:events:test-event',
    datacontenttype: 'application/json',
    data: {}
  });

  t.plan(2);

  const handler: ServeAsyncHandler<unknown> = () => {
    t.fail('should not be invoked');
  };

  const schema = {
    type: 'object',
    properties: {
      hello: { type: 'string' }
    },
    required: ['hello']
  };

  const app = buildAsync(handler, schema);

  const response = await app.inject({
    method: 'POST',
    url: '/',
    ...HTTP.binary(invalidCe)
  });

  t.is(response.statusCode, 400);
  t.is(response.body, 'Invalid cloud event data');
});

test('rejects invalid cloud event', async (t) => {
  const invalidCe = new CloudEvent({
    id: 'bar',
    source: 'urn:sources:test',
    type: 'urn:events:test-event',
    datacontenttype: 'random'
  });

  t.plan(2);

  const handler: ServeAsyncHandler<unknown> = () => {
    t.fail('should not get invoked');
  };

  const schema = {
    type: 'object',
    properties: {
      hello: { type: 'string' }
    },
    required: ['hello']
  };

  const app = buildAsync(handler, schema);

  const response = await app.inject({
    method: 'POST',
    url: '/',
    ...HTTP.binary(invalidCe)
  });

  t.is(response.statusCode, 415);
  t.like(JSON.parse(response.body), {
    statusCode: 415,
    error: 'Unsupported Media Type',
    message: 'Unsupported Media Type: random'
  });
});

test('rejects invalid request', async (t) => {
  t.plan(2);

  const handler: ServeAsyncHandler<unknown> = () => {
    t.fail('should not be invoked');
  };

  const schema = {};

  const app = buildAsync(handler, schema);

  const response = await app.inject({
    method: 'POST',
    url: '/',
    payload: { foo: 'bar' }
  });

  t.is(response.statusCode, 400);
  t.is(response.body, 'Invalid cloud event');
});

test('rejects on handler failure', async (t) => {
  const ce = new CloudEvent({
    id: 'foo',
    source: 'urn:sources:test',
    type: 'urn:events:test-event',
    datacontenttype: 'text/plain',
    data: 'bar'
  });

  t.plan(2);

  const handler: ServeAsyncHandler<unknown> = () => {
    throw new Error('something went wrong');
  };

  const schema = {};

  const app = buildAsync(handler, schema);

  const response = await app.inject({
    method: 'POST',
    url: '/',
    ...HTTP.binary(ce)
  });

  t.is(response.statusCode, 500);
  t.is(response.body, 'Internal failure');
});

test('rejects with custom http status code and error message', async (t) => {
  const ce = new CloudEvent({
    id: 'foo',
    source: 'urn:sources:test',
    type: 'urn:events:test-event',
    datacontenttype: 'text/plain',
    data: 'bar'
  });

  t.plan(2);

  const handler: ServeAsyncHandler<unknown> = () => {
    throw new HandlerExecutionError('something went wrong', 'FOO_BAR', {
      statusCode: 422,
      text: 'Custom error message'
    });
  };

  const schema = {};

  const app = buildAsync(handler, schema);

  const response = await app.inject({
    method: 'POST',
    url: '/',
    ...HTTP.binary(ce)
  });

  t.is(response.statusCode, 422);
  t.is(response.body, 'Custom error message');
});
