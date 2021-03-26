import { NodeClient } from '@sentry/node';

/**
 * Sentry logger, is a singleton.
 */
export class Logger {
  // singleton instance
  private static instance: Logger;

  // Sentry client
  private client: NodeClient;

  /**
   * Construct a new Sentry instance of Sentry logger
   * @param {string} dsn - DSN a.k.a client keys.
   */
  private constructor(dsn: string) {
    this.client = new NodeClient({
      dsn,
    });
  }

  /**
   * Get the current Sentry logger instance.
   * @return {Logger} - logger instance.
   */
  public static getInstance(): Logger {
    if (Logger.instance === undefined) {
      if (!process.env.OJK_DSN) {
        throw new Error('Secrets for logger does not exist!');
      }

      Logger.instance = new Logger(process.env.OJK_DSN);
    }

    return Logger.instance;
  }

  /**
   * Send an error log to Sentry.
   * @param {string} message - error message.
   */
  public async logError(message: string): Promise<boolean> {
    this.client.captureException(new Error(message));

    return this.client.flush(2000);
  }
}

/**
 * Capitalize each word in a string
 *
 * @param {string} sentence string to be capitalized
 * @return {string} capitalized string
 */
export function capitalize(sentence: string): string {
  return sentence
    .split(/\s+/)
    .map((str: string): string => {
      // ignore stopwords
      if (str === 'dan' || str === 'atau') {
        return str;
      }

      const chars = str.split('');

      if (!chars[0]) {
        return '';
      }

      chars[0] = chars[0].toUpperCase();

      return chars.join('');
    })
    .join(' ');
}

/**
 * Remove dashes and escape quotes from a string
 *
 * @param {string} sentence abnormal string
 * @return {string} normalized string
 */
export function normalize(sentence: string): string {
  sentence = sentence.trim();

  if (sentence === '-') {
    return '';
  }

  return sentence.replace(/\\"/g, '');
}
