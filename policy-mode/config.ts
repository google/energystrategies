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


// Initial configuration of policy choices to display.
export const INITIAL_POLICY: PolicyConfig = {
  solar_price: 1,
  wind_price: 1,
  nuclear_price: 1,
  ng_price: 1,
  carbon_tax: 0,
  rps: 0,
  rps_includes_carbon_capture: 0,
  rps_includes_nuclear_energy: 0,
  nuclear_allowed: 1,
  storage_allowed: 1,
};

// Pre-configured policy choices that support the policy-mode preset buttons.
export const PRESET_POLICY: {[s: string]: PolicyConfig} = {
  HIGH_RENEWABLES: {
    solar_price: 1,
    wind_price: 1,
    nuclear_price: 1,
    ng_price: 1,
    carbon_tax: 0,
    rps: 18,
    rps_includes_carbon_capture: 0,
    rps_includes_nuclear_energy: 0,
    nuclear_allowed: 1,
    storage_allowed: 1,
  },
  HIGH_CARBON_CAPTURE: {
    solar_price: 1,
    wind_price: 1,
    nuclear_price: 1,
    ng_price: 1,
    carbon_tax: 0,
    rps: 18,
    rps_includes_carbon_capture: 1,
    rps_includes_nuclear_energy: 0,
    nuclear_allowed: 1,
    storage_allowed: 1,
  },
  HIGH_NUCLEAR: {
    solar_price: 1,
    wind_price: 1,
    nuclear_price: 1,
    ng_price: 1,
    carbon_tax: 6,
    rps: 0,
    rps_includes_carbon_capture: 0,
    rps_includes_nuclear_energy: 0,
    nuclear_allowed: 1,
    storage_allowed: 1,
  },
};

// Policy-mode energy sources.
export const ALL_ENERGY_SOURCES: PolicyEnergySource[] = [
    'nuclear', 'wind', 'solar', 'ng', 'ngccs', 'coal', 'coalccs', 'hydro'];

// Policy-mode cost sources.
export const ALL_COST_SOURCES: PolicyBreakdownEntry[] = [
    'nuclear', 'wind', 'solar',
    'ng', 'ngccs', 'coal', 'coalccs', 'hydro', 'storage'];
