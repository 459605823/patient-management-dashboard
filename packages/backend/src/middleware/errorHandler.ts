import { type ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error && typeof error === 'object' && 'type' in error) {
    if (error.type === 'entity.parse.failed') {
      response.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Invalid JSON body.' } });
      return;
    }
    if (error.type === 'entity.too.large') {
      response
        .status(413)
        .json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large.' } });
      return;
    }
  }
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'SAVE_RESULT_UNAVAILABLE'
  ) {
    response.status(500).json({
      error: {
        code: 'SAVE_RESULT_UNAVAILABLE',
        message:
          'Patient saved, but the result could not be loaded. Check the patient list before trying again.',
      },
    });
    return;
  }
  console.error('API request failed:', error instanceof Error ? error.name : 'UnknownError');
  response.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
  });
};
