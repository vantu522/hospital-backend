// logger.js
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Format chung để hiển thị đầy đủ thông tin
const customFormat = format.printf(({ level, message, timestamp, ...meta }) => {
  let logString = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  
  // Thêm metadata nếu có
  if (Object.keys(meta).length > 0) {
    logString += ` | ${JSON.stringify(meta)}`;
  }
  
  return logString;
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    new transports.Console(),
    // Log tất cả levels vào thư mục logs chính
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: 5
    }),
    // Log debug riêng vào thư mục logs-debug
    new DailyRotateFile({
      level: 'debug',
      filename: 'logs-debug/debug-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: 5,
      format: format.combine(
        format((info) => info.level === 'debug' ? info : false)(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
      )
    }),
    // Log error riêng vào thư mục logs-error
    new DailyRotateFile({
      level: 'error',
      filename: 'logs-error/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: 5,
      format: format.combine(
        format((info) => info.level === 'error' ? info : false)(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
      )
    })
  ]
});

export default logger;
