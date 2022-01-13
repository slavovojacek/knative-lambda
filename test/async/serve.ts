import test from 'ava';
import { CloudEvent, HTTP } from 'cloudevents';

import { type AsyncServeHandler } from '../../lib/async/serve.types';
import { build } from '../../lib/async/serve.app';

test('validates and consumes valid cloud event', async (t) => {
  type Schema = { hello: string };

  const ce = new CloudEvent<Schema>({
    id: 'foo',
    source: 'urn:sources:test',
    type: 'urn:events:test-event',
    datacontenttype: 'application/json',
    data: { hello: 'John' }
  });

  t.plan(2);

  const handler: AsyncServeHandler<Schema> = (event) => {
    t.is(event.data.hello, 'John');
  };

  const schema = {
    type: 'object',
    properties: {
      hello: { type: 'string' }
    },
    required: ['hello']
  };

  const app = build(handler, schema);

  const response = await app.inject({
    method: 'POST',
    url: '/',
    ...HTTP.binary(ce)
  });

  t.is(response.statusCode, 202);
});
