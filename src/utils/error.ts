export const logError = (error: unknown, message: string): void => {
  console.error(`[Error] ${message}:`, error);
};

export class AppError extends Error {
  constructor(message: string, public readonly context: string) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown, context: string): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  return new AppError(message, context);
}; 