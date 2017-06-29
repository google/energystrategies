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
import {CompareController} from './controller';


describe('Compare mode controller', () => {
  let container: HTMLElement;
  let compViews: {[s: string]: PolicyDataView};
  let userView: PolicyDataView;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    container.innerHTML = `\
        <div id="compare-mode-summary-table"></div>
        <div id="compare-mode-policy-table"></div>
        <div id="compare-mode-cost-table"></div>
        <div id="compare-mode-energy-table"></div>
        <input type="text" id="share-link"/>`

    userView = {
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
    };

    compViews = {
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
    };
  });

  afterEach(() => {
    container.remove();
  });

  it('initialization', () => {
    const controller = new CompareController();

    // Verify that the comparison tables are created upon initialization.
    expect(d3.select(container).selectAll('table').size()).toEqual(0);
    controller.init(compViews, userView);
    expect(d3.select(container).selectAll('table').size()).toEqual(4);

    userView.summary.cost * 2;
    controller.update(userView);
  });
});
