/* Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/


// The default state of the dataset selection and page controls.
export const BASELINE: ScenarioOutcomeBreakdown<UtilityEnergySource> = {
  cost: 104e9, // $USD
  co2: 57.0e6, // metric tonnes/year
  energy: 280e6, // MWh/year
  // Note: the per-energy source breakdown is currently not utilized by utility
  // mode, but if required at some future point, the national-level breakdown
  // would make sense here.
  breakdown: null,
};
export const POPULATION = 39.1e6; // California; Source: 2015 US Census.

// Fixed cost (capital + fixed) per MW of capacity by energy source.
//
// Units are dollars USD per MW of capacity ($/MW)
export const FIXED_COST: UtilityEnergySourceMap<number> = {
  ng: 770633.,
  solar: 1356035.,
  wind: 2181533.,
  nuclear: 4667258.,
  coal: 3388939.,
  ngccs: 1505159,
  coalccs: 4559261.,
};

// Variable cost (including fuel) per MW-hour by energy source.
//
// Units are dollars USD per MWh ($/MWh).
export const VARIABLE_COST: UtilityEnergySourceMap<number> = {
  ng: 32.1,
  nuclear: 12.0,
  solar: 0.0,
  wind: 0.0,
  coal: 23.3,
  ngccs: 47.7,
  coalccs: 42.9,
};

// Rate of CO2 creation for each energy source.
//
// Units are tonnes-of-co2 per MWh-of-energy-supplied (tonnes/MWh)
export const CO2_RATE: UtilityEnergySourceMap<number> = {
  ng: 0.4538,
  nuclear: 0.0,
  solar: 0.0,
  wind: 0.0,
  coal: 0.8582,
  ngccs: 0.0549,
  coalccs: 0.1013,
};

// Pre-configured allocations that support the utility-mode preset buttons.
export type UtilityPresetOption = 'NUCLEAR' | 'WIND' | 'SOLAR' | 'BALANCED';
export const PRESET_ALLOCATIONS:
    {[K in UtilityPresetOption]: ProfileAllocations} = {
  // Nuclear-heavy.
  NUCLEAR: {
    solar: 0,
    wind: 0,
    ng: .53,
    nuclear: .71,
    coal: 0,
    coalccs: 0,
    ngccs: 0
  },
  // Wind-heavy.
  WIND: {
    solar: 0,
    wind: .66,
    ng: .76,
    nuclear: 0,
    coal: 0,
    coalccs: 0,
    ngccs: 0
  },
  // Solar-heavy.
  SOLAR: {
    solar: .5,
    wind: 0,
    ng: 1,
    nuclear: 0,
    coal: 0,
    coalccs: 0,
    ngccs: 0
  },
  // Balanced mix of energy sources.
  BALANCED: {
    solar: .19,
    wind: .26,
    ng: .50,
    nuclear: .42,
    coal: .1,
    coalccs: 0,
    ngccs: 0
  },
};

// Categorization of energy sources by dispatch capability.
export const NON_DISPATCHABLE_ENERGY_SOURCES: UtilityEnergySource[] = [
    'solar', 'wind', 'nuclear', 'coal', 'coalccs'];
export const DISPATCHABLE_ENERGY_SOURCES: UtilityEnergySource[] = [
    'ng', 'ngccs'];
export const ALL_ENERGY_SOURCES: UtilityEnergySource[] = (
    DISPATCHABLE_ENERGY_SOURCES.concat(NON_DISPATCHABLE_ENERGY_SOURCES));
// Not all energy sources have a corresponding slider directly controlling;
// fossil fuel-based sources have multiple variants (ccs/non-ccs).
export const SLIDER_ENERGY_SOURCES: UtilityEnergySource[] = [
    'solar', 'wind', 'nuclear', 'coal', 'ng'];
