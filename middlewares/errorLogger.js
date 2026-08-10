const errorLogger = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${err.message}`);
  next(err); // pass to next error handler
};

module.exports = errorLogger;
