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

import * as transforms from '../transforms';
import * as formatters from '../formatters';
import {dimensionLevelFormatters} from '../policy-mode/config';


export const SUMMARY_TITLE = 'Summary';
export const SUMMARY_FIELDS: PolicyFieldExtractor[] = [
  {
    field: 'co2',
    title: 'Carbon emissions impact (Mt CO2/yr)',
    extractor: view => view.summary.co2,
    formatter: formatters.largeNumberFormatter,
  },
  {
    field: 'cost',
    title: 'Cost impact ($USD/MWh)',
    extractor: view => transforms.totalCost(view),
    formatter: formatters.currencyFormatter,
  },
];

export const POLICY_TITLE = 'Policy choices';
export const POLICY_FIELDS: PolicyFieldExtractor[] = [
  {
    field: 'rps',
    title: 'Clean energy fraction (% of generation)',
    extractor: view => view.choices.rps,
    formatter: dimensionLevelFormatters.rps,
  },
  {
    field: 'rps_includes_nuclear_energy',
    title: 'Clean energy includes nuclear',
    extractor: view => view.choices.rps_includes_nuclear_energy,
    formatter: dimensionLevelFormatters.rps_includes_nuclear_energy,
  },
  {
    field: 'rps_includes_carbon_capture',
    title: 'Clean energy includes CCS',
    extractor: view => view.choices.rps_includes_carbon_capture,
    formatter: dimensionLevelFormatters.rps_includes_carbon_capture,
  },
  {
    field: 'carbon_tax',
    title: 'Clean energy fraction (% of generation)',
    extractor: view => view.choices.rps,
    formatter: dimensionLevelFormatters.rps,
  },
  {
    field: 'nuclear_allowed',
    title: 'Nuclear power allowed',
    extractor: view => view.choices.nuclear_allowed,
    formatter: dimensionLevelFormatters.nuclear_allowed,
  },
  {
    field: 'storage_allowed',
    title: 'Energy storage is allowed',
    extractor: view => view.choices.storage_allowed,
    formatter: dimensionLevelFormatters.storage_allowed,
  },
  {
    field: 'ng_price',
    title: 'Natural gas fuel price',
    extractor: view => view.choices.ng_price,
    formatter: dimensionLevelFormatters.ng_price,
  },
  {
    field: 'solar_price',
    title: 'Solar plant price',
    extractor: view => view.choices.solar_price,
    formatter: dimensionLevelFormatters.solar_price,
  },
  {
    field: 'wind_price',
    title: 'Wind plant price',
    extractor: view => view.choices.wind_price,
    formatter: dimensionLevelFormatters.wind_price,
  },
  {
    field: 'nuclear_price',
    title: 'Nuclear plant price',
    extractor: view => view.choices.nuclear_price,
    formatter: dimensionLevelFormatters.nuclear_price,
  },
];

export const COST_TITLE = 'Cost breakdown';
export const COST_FIELDS: PolicyFieldExtractor[] = [
  {
    field: 'storage_cost',
    title: 'energy storage',
    extractor: view => transforms.resourceCost(view, 'storage'),
    formatter: formatters.currencyFormatter,
  },
  {
    field: 'solar_cost',
    title: 'solar cost',
    extractor: view => transforms.resourceCost(view, 'solar'),
    formatter: formatters.currencyFormatter,
  },
  {
    field: 'wind_cost',
    title: 'wind cost',
    extractor: view => transforms.resourceCost(view, 'wind'),
    formatter: formatters.currencyFormatter,
  },
  {
    field: 'nuclear_cost',
    title: 'nuclear cost',
    extractor: view => transforms.resourceCost(view, 'nuclear'),
    formatter: formatters.currencyFormatter,
  },
  {
    field: 'ng_cost',
    title: 'NG cost',
    extractor: view => transforms.resourceCost(view, 'ng'),
    formatter: formatters.currencyFormatter,
  },
  {
    field: 'ngccs_cost',
    title: 'NG + CCS cost',
    extractor: view => transforms.resourceCost(view, 'ngccs'),
    formatter: formatters.currencyFormatter,
  },
  {
    field: 'coal_cost',
    title: 'coal cost',
    extractor: view => transforms.resourceCost(view, 'coal'),
    formatter: formatters.currencyFormatter,
  },
  {
    field: 'coalccs_cost',
    title: 'coal + CCS cost',
    extractor: view => transforms.resourceCost(view, 'coalccs'),
    formatter: formatters.currencyFormatter,
  },
  {
    field: 'hydro_cost',
    title: 'NG cost',
    extractor: view => transforms.resourceCost(view, 'ng'),
    formatter: formatters.currencyFormatter,
  },
  {
    field: 'cost',
    title: 'Total cost ($USD/MWh)',
    extractor: view => transforms.totalCost(view),
    formatter: formatters.currencyFormatter,
  },
];

export const ENERGY_TITLE = 'Energy breakdown';
export const ENERGY_FIELDS: PolicyFieldExtractor[] = [
  {
    field: 'solar_energy',
    title: 'solar generation',
    extractor: view => transforms.energyFraction(view, 'solar'),
    formatter: formatters.fractionMWhFormatter,
  },
  {
    field: 'wind_cost',
    title: 'wind generation',
    extractor: view => transforms.energyFraction(view, 'wind'),
    formatter: formatters.fractionMWhFormatter,
  },
  {
    field: 'nuclear_cost',
    title: 'nuclear generation',
    extractor: view => transforms.energyFraction(view, 'nuclear'),
    formatter: formatters.fractionMWhFormatter,
  },
  {
    field: 'ng_cost',
    title: 'NG generation',
    extractor: view => transforms.energyFraction(view, 'ng'),
    formatter: formatters.fractionMWhFormatter,
  },
  {
    field: 'ngccs_cost',
    title: 'NG + CCS generation',
    extractor: view => transforms.energyFraction(view, 'ngccs'),
    formatter: formatters.fractionMWhFormatter,
  },
  {
    field: 'coal_cost',
    title: 'coal generation',
    extractor: view => transforms.energyFraction(view, 'coal'),
    formatter: formatters.fractionMWhFormatter,
  },
  {
    field: 'coalccs_cost',
    title: 'coal + CCS generation',
    extractor: view => transforms.energyFraction(view, 'coalccs'),
    formatter: formatters.fractionMWhFormatter,
  },
  {
    field: 'hydro_cost',
    title: 'NG generation',
    extractor: view => transforms.energyFraction(view, 'ng'),
    formatter: formatters.fractionMWhFormatter,
  },
  {
    field: 'energy',
    title: 'Total energy',
    extractor: view => 1,
    formatter: formatters.fractionMWhFormatter,
  },
];
