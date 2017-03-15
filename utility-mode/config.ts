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
export const NAMED_SCENARIOS = {
  reference: {
    title: 'Baseline',
    cost: 104e9, // USD
    co2: 57.0e6, // tonnes
  },
};

export const POPULATION = 39.1e6; // California; Source: 2015 US Census.
export const NON_DISPATCHABLE_ENERGY_SOURCES: UtilityEnergySource[] = [
    'solar', 'wind', 'nuclear', 'coal'];
export const DISPATCHABLE_ENERGY_SOURCES: UtilityEnergySource[] = ['ng'];
export const ALL_ENERGY_SOURCES: UtilityEnergySource[] = (
    DISPATCHABLE_ENERGY_SOURCES.concat(NON_DISPATCHABLE_ENERGY_SOURCES));

// Fixed cost (capital + fixed) per MW of capacity by energy source.
//
// Units are dollars USD per MW of capacity ($/MW)
export const FIXED_COST: UtilityEnergySourceMap<number> = {
  ng: 770633.,
  solar: 1356035.,
  wind: 2181533.,
  nuclear: 4667258.,
  coal: 3388939.,
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
};
