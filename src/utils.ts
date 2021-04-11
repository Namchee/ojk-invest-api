const stopwords = ['dan', 'atau'];

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
      // do not capitalize stopwords
      if (stopwords.includes(str)) {
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
 * Remove dashes and unescape double quotes from a string
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
