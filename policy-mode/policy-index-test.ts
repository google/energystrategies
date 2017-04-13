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


import {NDArrayIndex, parsePolicyRowCSV} from './policy-index';


describe('Sweep dataset index', () => {
  let schema: PolicyDatasetSchema;

  beforeEach(() => {
    schema = {
      dimensions: [
        'solar_price',
        'wind_price',
        'nuclear_price',
        'ng_price',
        'carbon_tax',
        'rps',
        'rps_includes_carbon_capture',
        'rps_includes_nuclear_energy',
        'nuclear_allowed',
        'storage_allowed',
      ],
      facts: [
        'co2',
        'cost',
        'storage_cost',
        'solar_energy',
        'solar_cost',
        'wind_energy',
        'wind_cost',
        'nuclear_energy',
        'nuclear_cost',
        'ng_energy',
        'ng_cost',
        'ngccs_energy',
        'ngccs_cost',
        'coal_energy',
        'coal_cost',
        'coalccs_energy',
        'coalccs_cost',
        'hydro_energy',
        'hydro_cost',
      ],
      scales: {
        solar_price: [0, 1],
        wind_price: [0],
        nuclear_price: [0],
        ng_price: [0],
        carbon_tax: [0],
        rps: [0],
        rps_includes_carbon_capture: [0],
        rps_includes_nuclear_energy: [0],
        nuclear_allowed: [0],
        storage_allowed: [0],
      },
      shape: [
        2,  // solar_price
        1,  // wind_price
        1,  // nuclear_price
        1,  // ng_price
        1,  // carbon_tax
        1,  // rps
        1,  // rps_includes_carbon_capture
        1,  // rps_includes_nuclear_energy
        1,  // nuclear_allowed
        1,  // storage_allowed
      ],
      baseline: null,
      population: null,
    };
  });

  it('parses a single scenario dataset row', () => {
    const row: PolicyDataRow<string> = {
      co2: '80',
      cost: '38',
      storage_cost: '7',
      solar_energy: '0',
      solar_cost: '0',
      wind_energy: '10',
      wind_cost: '10',
      nuclear_energy: '10',
      nuclear_cost: '10',
      ng_energy: '100',
      ng_cost: '11',
      ngccs_energy: '0',
      ngccs_cost: '0',
      coal_energy: '0',
      coal_cost: '0',
      coalccs_energy: '0',
      coalccs_cost: '0',
      hydro_energy: '0',
      hydro_cost: '0',
    };

    const scenario = parsePolicyRowCSV(row, schema);

    expect(scenario).toEqual({
      co2: 80,
      cost: 38,
      energy: 10 + 10 + 100,
      breakdown: {
        storage: {cost: 7},
        solar: {cost: 0, energy: 0},
        wind: {cost: 10, energy: 10},
        nuclear: {cost: 10, energy: 10},
        ng: {cost: 11, energy: 100},
        ngccs: {cost: 0, energy: 0},
        coal: {cost: 0, energy: 0},
        coalccs: {cost: 0, energy: 0},
        hydro: {cost: 0, energy: 0},
      }
    });
  });

  it('minimal sweep dataset with 2 rows.', () => {
    const dataset: PolicyDataset = {
      schema: schema,
      scenarios: [
        {
          // Facts.
          co2: '10',
          cost: '100',
          storage_cost: '10',
          solar_energy: '10',
          solar_cost: '10',
          wind_energy: '10',
          wind_cost: '10',
          nuclear_energy: '10',
          nuclear_cost: '10',
          ng_energy: '10',
          ng_cost: '10',
          ngccs_energy: '0',
          ngccs_cost: '0',
          coal_energy: '10',
          coal_cost: '10',
          coalccs_energy: '0',
          coalccs_cost: '0',
          hydro_energy: '10',
          hydro_cost: '10',
        },
        {
          // Facts.
          co2: '7',
          cost: '200',
          storage_cost: '10',
          solar_energy: '10',
          solar_cost: '10',
          wind_energy: '10',
          wind_cost: '10',
          nuclear_energy: '10',
          nuclear_cost: '10',
          ng_energy: '10',
          ng_cost: '10',
          ngccs_energy: '0',
          ngccs_cost: '0',
          coal_energy: '10',
          coal_cost: '10',
          coalccs_energy: '0',
          coalccs_cost: '0',
          hydro_energy: '10',
          hydro_cost: '10',
        },
      ],
    };
    const index = new NDArrayIndex(dataset);
    const scenario = index.select({
      solar_price: 0,
      wind_price: 0,
      nuclear_price: 0,
      ng_price: 0,
      carbon_tax: 0,
      rps: 0,
      rps_includes_carbon_capture: 0,
      rps_includes_nuclear_energy: 0,
      nuclear_allowed: 0,
      storage_allowed: 0,
    });

    const expected: ScenarioOutcomeBreakdown<PolicyBreakdownEntry> = {
      co2: 10,
      cost: 100,
      energy: 10 + 10 + 10 + 10 + 10 + 10,
      breakdown: {
        solar: {
          energy: 10,
          cost: 10,
        },
        ng: {
          energy: 10,
          cost: 10,
        },
        ngccs: {
          energy: 0,
          cost: 0,
        },
        wind: {
          energy: 10,
          cost: 10,
        },
        nuclear: {
          energy: 10,
          cost: 10,
        },
        coal: {
          energy: 10,
          cost: 10,
        },
        coalccs: {
          energy: 0,
          cost: 0,
        },
        hydro: {
          energy: 10,
          cost: 10,
        },
        storage: {
          cost: 10,
        }
      }
    };

    expect(scenario.co2).toEqual(expected.co2);
    expect(scenario.cost).toEqual(expected.cost);
    expect(expected.breakdown.solar).toEqual(scenario.breakdown.solar);
    expect(scenario.breakdown.wind).toEqual(expected.breakdown.wind);
    expect(scenario.breakdown.coal).toEqual(expected.breakdown.coal);
    expect(scenario.breakdown.ng).toEqual(expected.breakdown.ng);
    expect(scenario.breakdown.nuclear).toEqual(expected.breakdown.nuclear);
    expect(scenario.breakdown.hydro).toEqual(expected.breakdown.hydro);
    expect(scenario.breakdown.storage).toEqual(expected.breakdown.storage);
    expect(scenario).toEqual(expected);
  });
});