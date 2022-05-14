import { resolve } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

import { ScrappingResult } from './scrapper/scrapper';

/**
 * Write scrapper output to a JSON file
 *
 * @param {Record<string, any>} result - scrapper's output
 * @param {string} filename - filename
 */
export function writeResult(
  result: ScrappingResult<Record<string, any> >,
  filename: string,
): void {
  const target = resolve(process.cwd(), 'data', `${filename}.json`);
  // preserve immutability to the data
  const copy = JSON.parse(JSON.stringify(result));

  const currentDate = (result.version as Date);
  copy.version = currentDate.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  writeFileSync(
    target,
    JSON.stringify(copy, null, 2),
    { encoding: 'utf-8' },
  );
}

/**
 * Bootstraps the output process. Will make
 * sure that the data folder exists and there
 * won't be any write conflicts.
 */
export function bootstrapOutput() {
  const dirPath = resolve(process.cwd(), 'data');

  const dirExist = existsSync(dirPath);

  if (!dirExist) {
    mkdirSync(dirPath);
  }
}
