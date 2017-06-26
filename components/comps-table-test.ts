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

/// <reference path="../typings/index.d.ts"/>

import * as src from './comps-table';
import * as util from '../util';
import * as transforms from '../transforms';
import * as formatters from '../formatters';
import {dimensionLevelFormatters} from '../policy-mode/config';
import {SUMMARY_FIELDS} from '../compare-mode/config';
import {PRESET_POLICY_DISPLAY_NAMES} from '../policy-mode/config';


describe('Comps table', () => {
  let displayElement: HTMLElement;
  let view: CompareDataView;

  beforeEach(() => {
    displayElement = document.createElement('div');
    document.body.appendChild(displayElement);
  });

  afterEach(() => {
    // Destroy the sandbox and its contents.
    displayElement.remove();
  });

  beforeEach(() => {
    view = {
      selection: {
        summary: {
          co2: 100,
          cost: 100 * transforms.DISCOUNT_RATE_YEARLY,
          energy: 100,
          breakdown: {
            storage: {cost: 10 * transforms.DISCOUNT_RATE_YEARLY},
            solar: {cost: 40 * transforms.DISCOUNT_RATE_YEARLY, energy: 50},
            wind: {cost: 0, energy: 0},
            nuclear: {cost: 0, energy: 0},
            hydro: {cost: 0, energy: 0},
            ng: {cost: 50 * transforms.DISCOUNT_RATE_YEARLY, energy: 50},
            ngccs: {cost: 0, energy: 0},
            coal: {cost: 0, energy: 0},
            coalccs: {cost: 0, energy: 0},
          },
        },
        choices: {
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
        },
        population: null,
        baseline: null,
        deltaToRef: null,
      },
      comps: {
        foo: {
          summary: {
            co2: 100,
            cost: 100 * transforms.DISCOUNT_RATE_YEARLY,
            energy: 100,
            breakdown: {
              storage: {cost: 10 * transforms.DISCOUNT_RATE_YEARLY},
              solar: {cost: 40 * transforms.DISCOUNT_RATE_YEARLY, energy: 50},
              wind: {cost: 0, energy: 0},
              nuclear: {cost: 0, energy: 0},
              hydro: {cost: 0, energy: 0},
              ng: {cost: 50 * transforms.DISCOUNT_RATE_YEARLY, energy: 50},
              ngccs: {cost: 0, energy: 0},
              coal: {cost: 0, energy: 0},
              coalccs: {cost: 0, energy: 0},
            },
          },
          choices: {
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
          },
          population: null,
          baseline: null,
          deltaToRef: null,
        },

        bar: {
          summary: {
            co2: 100,
            cost: 100 * transforms.DISCOUNT_RATE_YEARLY,
            energy: 100,
            breakdown: {
              storage: {cost: 10 * transforms.DISCOUNT_RATE_YEARLY},
              solar: {cost: 40 * transforms.DISCOUNT_RATE_YEARLY, energy: 50},
              wind: {cost: 0, energy: 0},
              nuclear: {cost: 0, energy: 0},
              hydro: {cost: 0, energy: 0},
              ng: {cost: 50 * transforms.DISCOUNT_RATE_YEARLY, energy: 50},
              ngccs: {cost: 0, energy: 0},
              coal: {cost: 0, energy: 0},
              coalccs: {cost: 0, energy: 0},
            },
          },
          choices: {
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
          },
          population: null,
          baseline: null,
          deltaToRef: null,
        }
      },
    };
  });

  it('configuration and initialization', () => {
    const fields: PolicyFieldExtractor[] = [
      {
        field: 'cost',
        title: 'Cost impact ($USD/MWh)',
        extractor: view => transforms.totalCost(view),
        formatter: formatters.currencyFormatter,
      },
      {
        field: 'co2',
        title: 'Carbon emissions impact (Mt CO2/yr)',
        extractor: view => view.summary.co2,
        formatter: formatters.largeNumberFormatter,
      },
    ];
    const comps = ['foo', 'bar'];
    const title = 'The title';
    const chart = new src.CompsTable(
        displayElement, view, comps, fields, {foo: 'Foo', bar: 'Bar'}, title);
    chart.update(view);

    // Validate the header row structure and content.
    const table = d3.select(displayElement).select('table');
    const headers = table.selectAll('tr.comps-table-row-header');
    expect(headers.size()).toBe(1);

    // Validate the display strings generated for each policy.
    const expectedColumnTexts = [title, 'Your policy', 'Foo', 'Bar'];
    headers.each(function(headerData, i) {
      d3.select(this).selectAll('td').each(function(compData, j) {
        const cell = d3.select(this);
        expect(cell.text()).toEqual(expectedColumnTexts[j]);
      });
    });

    // Validate the body rows for structure and content.
    const rows = table.selectAll('tr.comps-table-row');
    expect(rows.size()).toBe(fields.length);
    rows.each(function(rowData, i) {
      const row = d3.select(this);

      // The row should have a title cell.
      const titleCell = row.select('td.title');
      expect(titleCell.text()).toEqual(fields[i].title);

      // There should be one cell for each compared policy.
      row.selectAll('td.comps').each(function(compData, j) {
        const compCell = d3.select(this);
        const policy = view.comps[comps[j]];
        const value = fields[i].extractor(policy);
        expect(compCell.text()).toEqual(fields[i].formatter(value));
      });

      // There should be one cell representing the user's policy.
      const userCell = row.select('td.user');
      const userValue = fields[i].extractor(view.selection);
      expect(userCell.text()).toEqual(fields[i].formatter(userValue));
    });
  });
});
