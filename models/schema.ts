// analysis table
export interface Lci {
  oid: number;
  flow: string;
  category: string;
  unit: string;
  electricity_gpo: number; // 1 kWh electricity
  electricity_chp: number;
  diesel: number; // 1 m3
  gasoline: number; // 1 m3
  kerosene: number; // 1 m3
  transport_long: number; // t*km
  transport_short: number; // t*km
  total: number;
}
