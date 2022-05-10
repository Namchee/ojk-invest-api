/* eslint-disable camelcase */
export interface IllegalInvestment {
  id: number;
  name: string;
  address: string;
  phone: string[];
  web: string[];
  email: string[];
  entity_type: string;
  activity_type: string;
  input_date: string;
  description: string;
}

/**
 * Extract data from raw object to build investment object
 *
 * @param {Record<string, string>} data raw data
 * @return {IllegalInvestment} investment object
 */
export function extractInvestmentData(
  data: Record<string, string>[],
): IllegalInvestment[] {
  return [];
}
