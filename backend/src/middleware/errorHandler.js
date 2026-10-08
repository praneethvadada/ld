export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Not found.' });
}

// Express recognises an error handler by its four arguments, so `next` must stay in the signature.
export function errorHandler(error, req, res, next) {
  // Malformed or oversized request bodies are the caller's mistake, not a server fault.
  if (error.type === 'entity.parse.failed' || error.type === 'entity.too.large') {
    return res.status(error.status || 400).json({
      success: false,
      error: 'INVALID_REQUEST',
      message: 'The request could not be read.',
    });
  }

  // Log the detail for the operator; the visitor only ever sees a generic message.
  console.error(`[error] ${req.method} ${req.path}:`, error);

  return res.status(500).json({
    success: false,
    error: 'SERVER_ERROR',
    message: 'Something went wrong. Please try again in a moment.',
  });
}
