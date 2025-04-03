export type ErrorType = string | Error | unknown;

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function getErrorMessage(error: ErrorType): string {
  if (isError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

export function logError(error: ErrorType, context: string): void {
  const message = getErrorMessage(error);
  console.error(`[${context}] ${message}`);
  if (isError(error) && error.stack) {
    console.error(error.stack);
  }
}

export class AppError extends Error {
  constructor(message: string, public context?: string) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: ErrorType, context: string): never {
  logError(error, context);
  throw new AppError(getErrorMessage(error), context);
}