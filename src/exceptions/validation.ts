/**
 * Represents a user input validation error
 */
export class ValidationError extends Error {
  /**
   * Constructor for ValidationError
   * @param {string} message - error message
   */
  constructor(message: string) {
    super(message);
  }
}
