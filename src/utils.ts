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
