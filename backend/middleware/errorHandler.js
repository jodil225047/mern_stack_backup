const { failure } = require('../utils/response');
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err.name === 'ValidationError') return failure(res, 400, Object.values(err.errors).map(e => e.message).join(' '));
  if (err.name === 'CastError') return failure(res, 400, 'Invalid application identifier.');
  if (err.code === 11000) return failure(res, 409, 'A record with this unique value already exists.');
  console.error(err);
  const message = process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : (err.message || 'An unexpected server error occurred.');
  return failure(res, 500, message);
}
module.exports = errorHandler;
