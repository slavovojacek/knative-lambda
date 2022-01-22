type HandlerExecutionErrorHttpDetails = Partial<{
  statusCode: number;
  text: string;
}>;

export class HandlerExecutionError extends Error {
  readonly code: string;
  readonly http: Required<HandlerExecutionErrorHttpDetails>;

  constructor(message: string, code?: string, http?: HandlerExecutionErrorHttpDetails) {
    super(message);

    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;

    // Custom extensions
    this.code = code ??= 'INTERNAL_FAILURE';
    this.http = {
      // Provide sensible defaults
      statusCode: 500,
      text: 'Internal failure',
      ...http
    };

    // Clip the constructor invocation from the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
