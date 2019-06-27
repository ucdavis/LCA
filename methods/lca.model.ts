export interface RunParams {
    biomass: number;
    grindfuel: number;
    excavatfuel: number;
    distance: number;
}

// NonrenewableUnitEnergyContent were used to change units for nonrenewable group.
// Units change is not needed for other groups
export interface NonrenewableUnitEnergyContent {
    brownCoal: number;
    hardCoal: number;
    crudeOil: number;
    mineGas: number;
    naturalGas: number;
    Uranium: number;
    [key: string]: number;
  }
