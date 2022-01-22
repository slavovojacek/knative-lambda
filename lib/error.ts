type HandlerExecutionErrorDetail = Partial<{
  statusCode: number;
  errorCode: string;
  text: string;
}>;

export class HandlerExecutionError extends Error {
  readonly detail: Required<HandlerExecutionErrorDetail>;

  constructor(message: string, detail?: HandlerExecutionErrorDetail) {
    super(message);

    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;

    // Custom extensions
    this.detail = {
      // Provide sensible defaults
      statusCode: 500,
      errorCode: 'INTERNAL_FAILURE',
      text: message,
      ...detail
    };

    // Clip the constructor invocation from the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
