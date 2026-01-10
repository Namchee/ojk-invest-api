import { Standard, tryFormat } from '@namchee/telepon';

import { EMAIL_PATTERN, URL_PATTERN } from '../constant/regex.js';
import { TextProcessor } from '../services/processor.js';

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
 * @param {Record<string, string>} data raw data
 * @return {IllegalInvestment} investment object
 */
export function parseInvestmentData(data: Record<string, string>): IllegalInvestment {
  const nameProps = scanDataFromName(data.name);
  const addressProps = scanDataFromAddress(data.address);
  const phoneProps = scanDataFromPhone(data.phone);
  const emailProps = scanDataFromEmails(data.web);

  const entityType = new TextProcessor(data.entityType);
  const description = new TextProcessor(data.description);

  const activityType = data.activityType
    .split('/')
    .map(val => new TextProcessor(val).sanitize().capitalize().trim().getResult());

  return {
    id: 0, // will be set on the main function instead
    name: nameProps.name,
    alias: nameProps.alias,
    address: addressProps.address,
    web: [...new Set([...nameProps.web, ...emailProps.web])],
    email: [...new Set([...addressProps.email, ...phoneProps.email, ...emailProps.email])],
    phone: [...phoneProps.phone],
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
  if (name.startsWith('.')) {
    name = name.slice(1);
  }

  name = name.trim();

  const web = name.match(URL_PATTERN) ?? [];

  web.forEach(site => (name = name.replace(site, '')));

  const alias = name.match(/(?<=\()[\w\s]+(?=\))/) ?? [];

  alias
    .map(name => new TextProcessor(name).sanitize().trim().getResult())
    .filter(alias => !/Instagram/.test(alias))
    .forEach(alias => (name = name.replace(alias, '')));

  const names = name
    .split(/[;/]/)
    .map(name => name.replace(/[\(\)\\]+/g, '').trim())
    .filter(Boolean);

  if (!names.length && alias.length) {
    names.push(alias.shift() as string);
  }

  if (!names.length && web.length) {
    names.push(web.shift() as string);
  }

  const cleanedWeb = web.map(w => w.replace(/[\(\)]+/g, ''));

  return {
    name: names[0]?.trim(),
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
function scanDataFromAddress(address: string): {
  address: string[];
  email: string[];
} {
  address = new TextProcessor(address).sanitize().trim().getResult();
  const emails = address.match(EMAIL_PATTERN) ?? [];

  emails.forEach(email => (address = address.replace(email, '')));
  address = address.replaceAll(/(Email|Alamat) ?:/gi, '');
  address = address.replaceAll(/telepon ?: \d+/gi, '');

  const addresses = address
    .split(/\d\./)
    .map(address => {
      const cleanAddress = address.replace(/[;\.]/, '').trim();

      if (cleanAddress.startsWith('m')) {
        return cleanAddress.slice(1).trim();
      }

      return cleanAddress;
    })
    .filter(Boolean);

  return {
    address: addresses,
    email: emails,
  };
}

/**
 * Extract investment data from `phone` field
 *
 * @param {string} phone phone field
 * @return {Partial<IllegalInvestment>} partial investment object
 */
function scanDataFromPhone(phone: string): {
  phone: string[];
  email: string[];
} {
  phone = new TextProcessor(phone).sanitize().trim().getResult();
  phone = phone.replaceAll(/(Telepon|Customer Care) ?:/gi, '');

  const emails = phone.match(EMAIL_PATTERN) ?? [];

  emails.forEach(email => (phone = phone.replace(email, '')));

  const phoneNumbers = phone
    .split(/[;/]/)
    .map((phone: string) => {
      phone = phone.replaceAll(/[()\- +]+/g, '');

      try {
        return tryFormat(phone, Standard.LOCAL);
      } catch (err) {
        return '';
      }
    })
    .filter(Boolean);

  return {
    phone: phoneNumbers,
    email: emails,
  };
}

/**
 * Extract investment data from `phone` field
 *
 * @param {string} email phone field
 * @return {string[]} list of emails
 */
function scanDataFromEmails(email: string): {
  web: string[];
  email: string[];
} {
  email = new TextProcessor(email).sanitize().trim().getResult();

  return {
    web: email.match(URL_PATTERN) ?? [],
    email: email.match(EMAIL_PATTERN) ?? [],
  };
}
