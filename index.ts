export { serveAsync, serveSync } from './lib/serve';

export type {
  ServeAsyncHandler,
  ServeAsyncHandlerEvent,
  ServeAsyncOptions
} from './lib/async/types';

export type {
  ServeSyncHandler,
  ServeSyncHandlerEvent,
  ServeSyncHandlerResponse,
  ServeSyncOptions
} from './lib/sync/types';
