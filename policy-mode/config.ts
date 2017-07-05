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

import {COLORS} from '../style';
import * as transforms from '../transforms';


// CO2 emissions (Mt/year) for today (actual, not rebuilt outcome).
export const CO2_EMISSIONS_TODAY_ACTUAL = 1.82e9;
// CO2 emissions (Mt/year) for maximal NG scenario (hydro + NG).
export const CO2_EMISSIONS_MAX_NG = 1.25e9;
// CO2 emissions (Mt/year) goal.
export const CO2_EMISSIONS_GOAL = 218e6

// Initial configuration of policy choices to display.
export const INITIAL_POLICY: PolicyConfig = {
  rps: 0,
  carbon_tax: 0,
  rps_includes_carbon_capture: 0,
  rps_includes_nuclear_energy: 0,
  solar_price: 1,
  wind_price: 1,
  nuclear_price: 1,
  ng_price: 1,
  nuclear_allowed: 1,
  storage_allowed: 1,
};

// Pre-configured policy choices that support the policy-mode preset buttons.
export const PRESET_POLICY: {[K in PolicyPresetKey]: PolicyConfig} = {
  // $90/T carbon price, 0%
  BALANCED_LOW_CARBON: {
    rps: 0,
    carbon_tax: 15,
    rps_includes_carbon_capture: 0,
    rps_includes_nuclear_energy: 0,
    solar_price: 1,
    wind_price: 1,
    nuclear_price: 1,
    ng_price: 1,
    nuclear_allowed: 1,
    storage_allowed: 1,
  },

  // 85% clean fraction, $0/T, CCS not clean, nuclear not clean
  FAVOR_RENEWABLES: {
    rps: 17,
    carbon_tax: 0,
    rps_includes_carbon_capture: 0,
    rps_includes_nuclear_energy: 0,
    solar_price: 1,
    wind_price: 1,
    nuclear_price: 1,
    ng_price: 1,
    nuclear_allowed: 1,
    storage_allowed: 1,
  },

  // 85% clean fraction, $0/T, CCS clean, nuclear not clean
  FAVOR_CARBON_CAPTURE: {
    rps: 17,
    carbon_tax: 0,
    rps_includes_carbon_capture: 1,
    rps_includes_nuclear_energy: 0,
    solar_price: 1,
    wind_price: 1,
    nuclear_price: 1,
    ng_price: 1,
    nuclear_allowed: 1,
    storage_allowed: 1,
  },

  // 85% clean fraction, $0/T, CCS not clean, nuclear clean
  FAVOR_NUCLEAR: {
    rps: 17,
    carbon_tax: 0,
    rps_includes_carbon_capture: 0,
    rps_includes_nuclear_energy: 1,
    solar_price: 1,
    wind_price: 1,
    nuclear_price: 1,
    ng_price: 1,
    nuclear_allowed: 1,
    storage_allowed: 1,
  },
};

// Display names for each preset policy choice.
export const PRESET_POLICY_DISPLAY_NAMES: {[K in PolicyPresetKey]: string} = {
  BALANCED_LOW_CARBON: 'Balanced low-carbon',
  FAVOR_RENEWABLES: 'Favor renewables',
  FAVOR_CARBON_CAPTURE: 'Favor carbon capture',
  FAVOR_NUCLEAR: 'Favor nuclear',
};

// Policy-mode energy sources.
export const ALL_ENERGY_SOURCES: PolicyEnergySource[] = [
    'nuclear', 'wind', 'solar', 'ng', 'ngccs', 'coal', 'coalccs', 'hydro'];

// Policy-mode cost sources.
export const ALL_COST_SOURCES: PolicyBreakdownEntry[] = [
    'nuclear', 'wind', 'solar',
    'ng', 'ngccs', 'coal', 'coalccs', 'hydro', 'storage'];


// Display names to use for components of the policy outcome breakdown.
export const POLICY_BREAKDOWN_DISPLAY_NAMES: PolicyBreakdownDisplayNames = {
  nuclear: 'Nuclear',
  wind: 'Wind',
  solar: 'Solar',
  ng: 'Natural gas',
  ngccs: 'NG + CCS',
  coal: 'Coal',
  coalccs: 'Coal + CCS',
  hydro: 'Hydropower',
  storage: 'Storage',
};

// Display strings corresponding to boolean policy configuration choices.
// e.g., for boolean dimension "nuclear_allowed".
const BOOLEAN_DISPLAY_VALUES = ['False', 'True'];

// Policy dimension level display strings for representing zero-indexed tech
// price dimension levels; e.g., solar_price, wind_price, nuclear_price.
const TECH_PRICE_DISPLAY_VALUES = [
  'Optimistic future',
  'Moderate future',
  'Today',
];

// Policy dimension level display strings for representing zero-indexed market
// price dimension levels; e.g., ng_price.
const MARKET_PRICE_DISPLAY_VALUES = [
  'Low cost',
  'Medium cost',
  'High cost',
];

// Formats a boolean dimension level to a display string.
const booleanDimensionFormatter = (dimensionLevel: number) => {
  return BOOLEAN_DISPLAY_VALUES[dimensionLevel];
}

// Formats a zero-indexed ordinal dimension level to a display string.
const techPriceDimensionFormatter = (dimensionLevel: number) => {
  return TECH_PRICE_DISPLAY_VALUES[dimensionLevel];
}

// Formats a zero-indexed ordinal dimension level to a display string.
const marketPriceFormatter = (dimensionLevel: number) => {
  return MARKET_PRICE_DISPLAY_VALUES[dimensionLevel];
}

// Formatting functions for translating ordinal dimension levels to display
// string representations; e.g. for solar_price @level 2 => "Today".
export const dimensionLevelFormatters:
    {[K in PolicyDimension]: PolicyDimensionFormatter} = {

  nuclear_allowed: booleanDimensionFormatter,
  storage_allowed: booleanDimensionFormatter,
  rps_includes_carbon_capture: booleanDimensionFormatter,
  rps_includes_nuclear_energy: booleanDimensionFormatter,
  rps: rpsPercent => `${rpsPercent.toFixed(0)}%`,
  carbon_tax: tax => `$${tax.toFixed(0)}/t`,
  solar_price: techPriceDimensionFormatter,
  wind_price: techPriceDimensionFormatter,
  nuclear_price: techPriceDimensionFormatter,
  ng_price: marketPriceFormatter,
};
