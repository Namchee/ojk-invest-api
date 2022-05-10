/**
 * TextProcessor is used to process texts from OJK's website.
 * Uses builder pattern
 */
export class TextProcessor {
  // List of words similar to `unknown`
  private static readonly UNKNOWN_WORDS = [
    'tidak',
    'ketahui',
    'diketahui',
    '-',
    '\\"',
  ];

  // List of stop words that should be ignore on capitalization
  private static readonly STOP_WORDS = [
    'dan',
    'atau',
  ];

  /**
   * Constructor for text processor.
   *
   * @param {string} text text to be preprocessed
   */
  public constructor(private text: string) {}

  /**
   * Capitalize each words from the text except stop words
   *
   * @return {TextProcessor} processor instance
   */
  public capitalize(): TextProcessor {
    const processed = this.text.split(/\s+/)
      .map((word: string) => {
        if (TextProcessor.STOP_WORDS.includes(word)) {
          return word;
        }

        return word.slice(0, 1).toUpperCase() + word.slice(1);
      })
      .join(' ');

    this.text = processed;

    return this;
  }

  /**
   * Remove `unknown` or similar words from text and replaces
   * unescaped double quotes from text.
   *
   * @return {TextProcessor} processor instance
   */
  public sanitize(): TextProcessor {
    const regex = new RegExp(
      `${TextProcessor.UNKNOWN_WORDS.join('|')}`,
      'ig',
    );

    this.text = this.text.replace(regex, '');

    return this;
  }

  /**
   * Removes trailing and following whitespaces from the text
   *
   * @return {TextProcessor} processor instance
   */
  public trim(): TextProcessor {
    this.text = this.text.trim();

    return this;
  }

  /**
   * Return the processing result
   * @return {string} preprocessed text
   */
  public getResult(): string {
    return this.text;
  }
}
