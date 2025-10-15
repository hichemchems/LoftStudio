const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;

  // Log request
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

  // Log response when finished
  res.on('finish', () => {
    const statusCode = res.statusCode;
    const contentLength = res.get('Content-Length') || 0;
    console.log(`[${timestamp}] ${method} ${url} - ${statusCode} - ${contentLength} bytes`);
  });

  next();
};

module.exports = {
  logger
};
