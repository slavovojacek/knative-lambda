import test from 'ava';

import { buildSync } from '../lib/sync/app';
import { type ServeSyncHandler } from '../lib/sync/types';
import { HandlerExecutionError } from '../lib/error';

test('runs handler with validated body', async (t) => {
  t.plan(2);

  const schema = {
    body: {
      type: 'object',
      properties: {
        hello: { type: 'string' }
      },
      required: ['hello']
    }
  };

  type Schema = {
    Body: { hello: string };
  };

  const handler: ServeSyncHandler<Schema> = (event) => {
    t.is(event.body.hello, 'John');
    return { statusCode: 202 };
  };

  const options = { method: 'POST', url: '/' } as const;
  const app = buildSync(handler, schema, options);

  const response = await app.inject({
    ...options,
    payload: { hello: 'John' }
  });

  t.is(response.statusCode, 202);
});

test('runs handler with validated querystring', async (t) => {
  t.plan(2);

  const schema = {
    querystring: {
      type: 'object',
      properties: {
        hello: { type: 'string' }
      },
      required: ['hello']
    }
  };

  type Schema = {
    Querystring: { hello: string };
  };

  const handler: ServeSyncHandler<Schema> = (event) => {
    t.is(event.querystring.hello, 'John');
    return { statusCode: 202 };
  };

  const options = { method: 'POST', url: '/' } as const;
  const app = buildSync(handler, schema, options);

  const response = await app.inject({
    ...options,
    query: { hello: 'John' }
  });

  t.is(response.statusCode, 202);
});

test('runs handler with validated params', async (t) => {
  t.plan(3);

  const schema = {
    body: {
      type: 'object',
      properties: {
        age: { type: 'number' }
      },
      required: ['age']
    },
    params: {
      type: 'object',
      properties: {
        name: { type: 'string' }
      },
      required: ['name']
    }
  };

  type Schema = {
    Body: { age: number };
    Params: { name: string };
  };

  const handler: ServeSyncHandler<Schema> = (event) => {
    t.is(event.body.age, 42);
    t.is(event.params.name, 'John');
    return { statusCode: 202 };
  };

  const options = { method: 'PATCH', url: '/names/:name' } as const;
  const app = buildSync(handler, schema, options);

  const response = await app.inject({
    ...options,
    url: '/names/John',
    payload: { age: 42 }
  });

  t.is(response.statusCode, 202);
});

test('runs handler with validated headers', async (t) => {
  t.plan(2);

  const schema = {
    headers: {
      type: 'object',
      properties: {
        hello: { type: 'string' }
      },
      required: ['hello']
    }
  };

  type Schema = {
    Headers: { hello: string };
  };

  const handler: ServeSyncHandler<Schema> = (event) => {
    t.is(event.headers.hello, 'John');
    return { statusCode: 202 };
  };

  const options = { method: 'POST', url: '/' } as const;
  const app = buildSync(handler, schema, options);

  const response = await app.inject({
    ...options,
    headers: { hello: 'John' }
  });

  t.is(response.statusCode, 202);
});

test('runs handler with validated reply', async (t) => {
  const schema = {
    reply: {
      type: 'object',
      properties: {
        hello: { type: 'string' }
      },
      required: ['hello']
    }
  };

  type Schema = {
    Reply: { hello: string };
  };

  const handler: ServeSyncHandler<Schema> = (_event) => {
    return { statusCode: 200, body: { hello: 'John' } };
  };

  const options = { method: 'POST', url: '/' } as const;
  const app = buildSync(handler, schema, options);

  const response = await app.inject(options);

  t.is(response.statusCode, 200);
  t.is(response.body, JSON.stringify({ hello: 'John' }));
});

test('handler responds with set body and headers', async (t) => {
  const schema = {
    reply: {
      type: 'string'
    }
  };

  type Schema = {
    Reply: string;
  };

  const handler: ServeSyncHandler<Schema> = (_event) => {
    return { statusCode: 200, body: 'John', headers: { foo: 'bar' } };
  };

  const options = { method: 'GET', url: '/' } as const;
  const app = buildSync(handler, schema, options);

  const response = await app.inject(options);

  t.is(response.statusCode, 200);
  t.is(response.body, 'John');
  t.is(response.headers['foo'], 'bar');
});

test('handler rejects on schema mismatch', async (t) => {
  const schema = {
    body: {
      type: 'object',
      properties: {
        hello: { type: 'string' }
      },
      required: ['hello']
    }
  };

  type Schema = {
    Body: { hello: string };
  };

  const handler: ServeSyncHandler<Schema> = (_event) => {
    t.fail('cannot invoke handler');
    return { statusCode: 0 };
  };

  const options = { method: 'POST', url: '/' } as const;
  const app = buildSync(handler, schema, options);

  const response = await app.inject({
    ...options,
    payload: { foo: 'bar' }
  });

  t.is(response.statusCode, 400);
  t.deepEqual(JSON.parse(response.body), {
    statusCode: 400,
    error: 'Bad Request',
    message: "body should have required property 'hello'"
  });
});

test('rejects on handler failure', async (t) => {
  const schema = {};

  type Schema = { Body: never };

  const handler: ServeSyncHandler<Schema> = (_event) => {
    throw new Error('something went wrong');
  };

  const options = { method: 'POST', url: '/' } as const;
  const app = buildSync(handler, schema, options);

  const response = await app.inject({
    ...options,
    payload: { foo: 'bar' }
  });

  t.is(response.statusCode, 500);
  t.is(response.body, 'Internal failure');
});

test('rejects with custom http status code and error message', async (t) => {
  const schema = {};

  type Schema = { Body: never };

  const handler: ServeSyncHandler<Schema> = (_event) => {
    throw new HandlerExecutionError('something went wrong', 'FOO_BAR', {
      statusCode: 422,
      text: 'Custom error message'
    });
  };

  const options = { method: 'POST', url: '/' } as const;
  const app = buildSync(handler, schema, options);

  const response = await app.inject({
    ...options,
    payload: { foo: 'bar' }
  });

  t.is(response.statusCode, 422);
  t.is(response.body, 'Custom error message');
});
