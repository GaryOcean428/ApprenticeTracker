export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const errorHandler = async (error: unknown, context: string): Promise<void> => {
  if (error instanceof ApiError) {
    console.error(`${context} failed`, {
      statusCode: error.statusCode,
      message: error.message,
      context: error.context,
    });
  } else if (error instanceof Error) {
    console.error(`Unexpected ${context} error`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.error(`Unknown ${context} error`, { error });
  }
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

export const handleApiError = (error: unknown): { message: string; status: number } => {
  if (isApiError(error)) {
    return {
      message: error.message,
      status: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
    };
  }

  return {
    message: 'An unexpected error occurred',
    status: 500,
  };
};
