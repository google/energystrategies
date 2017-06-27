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

/// <reference path="../typings/index.d.ts" />

import * as transforms from '../transforms';
import * as src from './energy-breakdown-table';


const discounted = x => x * transforms.DISCOUNT_RATE_YEARLY;

describe('BreakdownTable component', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Destroy the sandbox and its contents.
    container.remove();
  });

  it('initialization and configuration', () => {
    const view: PolicyDataView =  {
      summary: {
        cost: discounted(100),
        energy: 20,
        co2: 0,
        breakdown: {
          solar: {cost: discounted(40), energy: 10, co2: 0},
          wind: {cost: discounted(40), energy: 10, co2: 0},
          nuclear: {cost: 0, energy: 0, co2: 0},
          ng: {cost: 0, energy: 0, co2: 0},
          ngccs: {cost: 0, energy: 0, co2: 0},
          coal: {cost: 0, energy: 0, co2: 0},
          coalccs: {cost: 0, energy: 0, co2: 0},
          hydro: {cost: 0, energy: 0, co2: 0},
          storage: {cost: discounted(20), energy: 0, co2: 0},
        }
      },
      baseline: null,
      deltaToRef: null,
      population: null,
      choices: null,
    };

    expect(d3.select(container).selectAll('tr.header').size()).toEqual(0);
    expect(d3.select(container).selectAll('tr.body').size()).toEqual(0);
    expect(d3.select(container).selectAll('tr.footer').size()).toEqual(0);

    const table = new src.PolicyBreakdownTable(
        container,
        view,
        ['solar', 'wind', 'storage'],
        {});

    expect(d3.select(container).selectAll('tr.header').size()).toEqual(1);
    expect(d3.select(container).selectAll('tr.body').size()).toEqual(3);
    expect(d3.select(container).selectAll('tr.footer').size()).toEqual(1);

    // Invoking update with the same data view should not change the table
    // elements or display string values.
    table.update(view);

    expect(d3.select(container).selectAll('tr.header').size()).toEqual(1);
    expect(d3.select(container).selectAll('tr.body').size()).toEqual(3);
    expect(d3.select(container).selectAll('tr.footer').size()).toEqual(1);
  });
});

describe('Breakdown table layout', () => {
  it('for a subset of energy sources and storage', () => {
    const view: PolicyDataView =  {
      summary: {
        cost: discounted(100),
        energy: 20,
        co2: 0,
        breakdown: {
          solar: {cost: discounted(40), energy: 10, co2: 0},
          wind: {cost: discounted(40), energy: 10, co2: 0},
          nuclear: {cost: 0, energy: 0, co2: 0},
          ng: {cost: 0, energy: 0, co2: 0},
          ngccs: {cost: 0, energy: 0, co2: 0},
          coal: {cost: 0, energy: 0, co2: 0},
          coalccs: {cost: 0, energy: 0, co2: 0},
          hydro: {cost: 0, energy: 0, co2: 0},
          storage: {cost: discounted(20), energy: 0, co2: 0},
        }
      },
      baseline: null,
      deltaToRef: null,
      population: null,
      choices: null,
    };

    const layout = src.getBreakdownTableLayout(
        view,
        ['solar', 'ng', 'wind', 'storage'],
        {
          solar: 'Solar',
          wind: 'Wind',
          ng: 'Natural gas',
          storage: 'Storage'
        });

    expect(layout).toEqual([
      {
        type: 'header',
        source: null,
        title: 'Sources',
        values: ['Energy', 'Cost']
      },
      {
        type: 'body',
        source: 'solar',
        title: 'Solar',
        values: ['0.50 MWh', '$2.00']
      },
      {
        type: 'body',
        source: 'ng',
        title: 'Natural gas',
        values: ['0.00 MWh', '$0.00']
      },
      {
        type: 'body',
        source: 'wind',
        title: 'Wind',
        values: ['0.50 MWh', '$2.00']
      },
      {
        type: 'body',
        source: 'storage',
        title: 'Storage',
        values: ['-', '$1.00']
      },
      {
        type: 'footer',
        source: null,
        title: 'Total',
        values: ['1.00 MWh', '$5.00'],
      },
    ]);
  });
});