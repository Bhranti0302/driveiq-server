// Helper to create errors with HTTP status codes
const createError = (message, statusCode = 500) => {
  const error = new Error(message);

  error.success = false;
  error.statusCode = statusCode;

  return error;
};

module.exports = createError;
