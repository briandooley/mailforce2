var moment = require('moment');
var winston = require('winston');
winston.emitErrs = true;

var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
      timestamp: function() {
        return moment().toISOString();
      }
    })
  ],
  exitOnError: false
});

module.exports = logger;
