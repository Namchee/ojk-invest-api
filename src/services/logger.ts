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
      environment: process.env.NODE_ENV,
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
   *
   * @param {Error} err - error object.
   */
  public logError(err: Error): void {
    this.client.captureException(err);
  }
}
