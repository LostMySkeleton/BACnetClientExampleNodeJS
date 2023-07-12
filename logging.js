/** 
 * Logging for debugging and errors
 * 
 * Last updated: 2023-July-11
 * Author: Steven Smethurst
 * 
 * Example use:
 * ```js
 *    const loggerObj = require('./logging');
 *    const logger = loggerObj.child({ label: 'Example' });
 *    logger.error('An error message');
 *    logger.debug('An debug message');
 *    logger.info("An info message");
 * ```
 */

const winston = require('winston');
var options = {
    file: {
        level: 'debug',
        filename: './app.log',
        handleExceptions: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        colorize: true,
    }
};

var logger = winston.createLogger ({
    transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console),
    ],
    exitOnError: false,
    format: winston.format.combine(
        winston.format.timestamp({
            format: "MM-DD-YYYY HH:mm:ss",
        }),
        winston.format.align(),
        winston.format.printf((message) => `${[message.timestamp]} ${message.label} ${message.level}: ${message.message}`)
    ),
});

module.exports = logger;