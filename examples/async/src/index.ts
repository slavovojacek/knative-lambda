import { serveAsync } from 'knative-lambda';

import * as schema from './schema';
import { handler } from './handler';

export default serveAsync(handler, schema.event);
