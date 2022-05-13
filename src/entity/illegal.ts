import { Standard, tryFormat } from '@namchee/telepon';

import { TextProcessor } from '../services/processor';

// courtesy of: https://gist.github.com/dperini/729294
// eslint-disable-next-line max-len
const urlRegex = /\(?(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?\)?/g;
// eslint-disable-next-line max-len
const emailRegex = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;

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
  const addressProps = scanDataFromAddress(data.address);
  const phoneProps = scanDataFromPhone(data.phone);
  const emailProps = scanDataFromEmails(data.web);

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
    address: addressProps.address,
    web: [...new Set([...nameProps.web, ...emailProps.web])],
    email: [
      ...new Set([
        ...addressProps.email,
        ...phoneProps.email,
        ...emailProps.email,
      ]),
    ],
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
function scanDataFromAddress(address: string): {
  address: string[];
  email: string[];
} {
  address = new TextProcessor(address).sanitize().trim().getResult();
  const emails = address.match(emailRegex) || [];

  emails.forEach(email => (address = address.replace(email, '')));
  address = address.replaceAll(/(Email|Alamat) ?:/gi, '');
  address = address.replaceAll(/telepon ?: \d+/gi, '');

  const addresses = address
    .split(/\d\./)
    .map((address) => {
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

  const emails = phone.match(emailRegex) || [];

  emails.forEach(email => (phone = phone.replace(email, '')));

  const phoneNumbers = phone
    .split(/[;/]/)
    .map((phone: string) => {
      phone = phone.replaceAll(/[()\-  +]+/g, '');

      try {
        return tryFormat(phone, Standard.LOCAL);
      } catch (err) {
        return phone;
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
  const web = email.match(urlRegex) || [];

  return {
    web,
    email: email.match(emailRegex) || [],
  };
}
