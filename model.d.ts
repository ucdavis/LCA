export interface LcaInputs {
    technology: string;
    diesel: number;
    gasoline: number;
    jetfuel: number;
    distance: number;
    construction: number;
    equipment: number;
}
export interface LcaOutputs {
    lifeCycleEmissions: LifeCycleEmissions;
    lifeCycleImpacts: LifeCycleImpacts;
    lifeStageCO2: LifeStage;
    lifeStageGWP: LifeStage;
}
export interface Lci {
    index: number;
    name: string;
    unit: string;
    gpo: number;
    chp: number;
    gp: number;
    diesel: number;
    gasoline: number;
    jetfuel: number;
    transport: number;
    construction: number;
    equipment: number;
}
export interface Traci {
    index: number;
    name: string;
    global_warming_air: number;
    acidification_air: number;
    hh_particulate_air: number;
    eutrophication_air: number;
    smog_air: number;
}
export interface LifeCycleEmissions {
    CO2: number;
    CH4: number;
    N2O: number;
    CO: number;
    NOx: number;
    PM10: number;
    PM25: number;
    SOx: number;
    VOC: number;
    CI: number;
}
export interface LifeStage {
    harvest: number;
    transport: number;
    conversion: number;
    construction: number;
    equipment: number;
}
export interface LifeCycleImpacts {
    global_warming_air: number;
    acidification_air: number;
    hh_particulate_air: number;
    eutrophication_air: number;
    smog_air: number;
}
