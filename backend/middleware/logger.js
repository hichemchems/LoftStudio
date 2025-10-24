const fs = require('fs');
const path = require('path');

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;

  // Log message
  const logMessage = `[${timestamp}] ${method} ${url} - IP: ${ip}`;

  // Log to console
  console.log(logMessage);

  // Log to file if in production (o2switch)
  if (process.env.NODE_ENV === 'production') {
    const logDir = path.join(process.env.HOME || '/home', 'logs');
    const logFile = path.join(logDir, 'loftbarber.log');

    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
      try {
        fs.mkdirSync(logDir, { recursive: true });
      } catch (error) {
        console.error('Failed to create log directory:', error);
      }
    }

    // Append to log file
    try {
      fs.appendFileSync(logFile, logMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  // Log response when finished
  res.on('finish', () => {
    const statusCode = res.statusCode;
    const contentLength = res.get('Content-Length') || 0;
    const responseLog = `[${timestamp}] ${method} ${url} - ${statusCode} - ${contentLength} bytes`;

    console.log(responseLog);

    // Log response to file if in production
    if (process.env.NODE_ENV === 'production') {
      const logDir = path.join(process.env.HOME || '/home', 'logs');
      const logFile = path.join(logDir, 'loftbarber.log');

      try {
        fs.appendFileSync(logFile, responseLog + '\n');
      } catch (error) {
        console.error('Failed to write response to log file:', error);
      }
    }
  });

  next();
};

module.exports = {
  logger
};
