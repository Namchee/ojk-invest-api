import { readFile, existsSync } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';
import { Logger } from '../logger';

const readFileAsync = promisify(readFile);

/**
 * Get data version from a data file.
 *
 * @param {string} name file name
 * @return {Promise<string>} data version, empty string if not exists.
 */
async function readDataVersion(name: string): Promise<string> {
  const path = resolve(process.cwd(), 'data', `${name}.json`);
  const isExist = existsSync(path);

  if (!isExist) {
    return '';
  }

  const rawContents = await readFileAsync(path);
  return JSON.parse(rawContents.toString('utf-8'))['version'];
}

/**
 * Get data version from all data files and compare them.
 *
 * @return {Promise<string>} date string if all data are consistent.
 * @throws {Error} if the data version is not consistent.
 */
export async function getVersion(): Promise<string> {
  const dataFiles = await Promise.all([
    readDataVersion('apps'),
    readDataVersion('illegals'),
    readDataVersion('products'),
  ]);

  const versions = [...new Set(dataFiles)];

  if (versions.length > 1) {
    Logger.getInstance().logError(
      new Error('Inconsistent data version'),
    );

    return '';
  }

  return versions[0];
}
