import { resolve } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

import { ScrappingResult } from './scrapper/scrapper';

/**
 * Write scrapper output to a JSON file
 *
 * @param {Record<string, any>} scrappingResult - scrapper's output
 * @param {string} filename - filename
 */
export function writeScrappingResultToFile(
  scrappingResult: ScrappingResult<Record<string, any> >,
  filename: string,
): void {
  const target = resolve(process.cwd(), 'data', `${filename}.json`);
  // preserve immutability to the data
  const dataCopy = JSON.parse(JSON.stringify(scrappingResult));

  dataCopy.version = scrappingResult.version.toLocaleDateString('id-ID');

  writeFileSync(
    target,
    JSON.stringify(dataCopy, null, 2),
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
