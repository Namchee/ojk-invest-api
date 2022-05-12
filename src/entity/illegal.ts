import emailRegex from 'email-regex-safe';

import { TextProcessor } from '../services/processor';

// courtesy of: https://gist.github.com/dperini/729294
// eslint-disable-next-line max-len
const urlRegex = /\(?(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?\)?/i;

/* eslint-disable camelcase */
export interface IllegalInvestment {
  id: number;
  name: string;
  alias: string[];
  address: string[];
  phone: string[];
  web: string[];
  email: string[];
  entity_type: string;
  activity_type: string[];
  input_date: string;
  description: string;
}

/**
 * Extract data from raw object to build investment object
 *
 * @param {number} index item's index on the list
 * @param {Record<string, string>} data raw data
 * @return {IllegalInvestment} investment object
 */
export function parseInvestmentData(
  index: number,
  data: Record<string, string>,
): IllegalInvestment {
  const nameProps = scanDataFromName(data.name);

  const entityType = new TextProcessor(data.entityType);
  const description = new TextProcessor(data.description);

  const activityType = data.activityType
    .split('/')
    .map(val =>
      new TextProcessor(val).sanitize().capitalize().trim().getResult(),
    );

  return {
    id: index,
    name: nameProps.name,
    alias: nameProps.alias,
    address: [],
    web: [...nameProps.web],
    email: [],
    phone: [],
    entity_type: entityType.sanitize().capitalize().trim().getResult(),
    activity_type: activityType,
    input_date: data.input_date,
    description: description.sanitize().trim().getResult(),
  };
}

/**
 * Extract investment data from `name` field
 *
 * @param {string} name name field
 * @return {Partial<IllegalInvestment>} partial investment object
 */
function scanDataFromName(name: string): {
  name: string;
  alias: string[];
  web: string[];
} {
  const web = name.match(urlRegex) || [];

  web.forEach(site => (name = name.replace(site, '')));

  const alias = name.match(/(?<=\()[\w\s]+(?=\))/) || [];

  alias.forEach(alias => (name = name.replace(alias, '')));

  const names = name
    .split(/[;\-/]/)
    .map(val => val.replace(/[\(\)]+/g, '').trim())
    .filter(Boolean);

  const cleanedWeb = web.map(w => w.replace(/[\(\)]+/g, ''));

  return {
    name: names[0],
    alias: [...names.slice(1), ...(alias as string[])],
    web: cleanedWeb,
  };
}

/**
 * Extract investment data from `address` field
 *
 * @param {string} address address field
 * @return {Partial<IllegalInvestment>} partial investment object
 */
function scanDataFromAddress(address: string): Partial<IllegalInvestment> {
  return {};
}
