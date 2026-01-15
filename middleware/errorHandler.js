export const errorHandler = (err, req, res, next) => {
  console.error(err);

  const isDevelopment = process.env.NODE_ENV === 'development';

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(isDevelopment && { stack: err.stack }), // Only include stack trace in development
  });
};
