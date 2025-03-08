import log4js from 'log4js';

// Define application name dynamically or set a default
const applicationName = process.env.APP_NAME || 'myApp';
const logLevel = process.env.LOG_LEVEL || 'info';

// Configure log4js
log4js.configure({
  appenders: {
    [applicationName]: { type: 'file', filename: `${applicationName}.log` },
  },
  categories: { default: { appenders: [applicationName], level: logLevel } },
});

// Export a logger instance
const logger: log4js.Logger = log4js.getLogger(applicationName);

export default logger;
