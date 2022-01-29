export const event = {
  type: 'object',
  properties: {
    hello: { type: 'string' }
  },
  required: ['hello']
};

export type Event = { hello: string };
