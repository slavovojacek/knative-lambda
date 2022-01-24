import { AsyncLocalStorage } from 'async_hooks';

export const traceStore = new AsyncLocalStorage<string>();
