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

import * as util from '../util';
import * as cost from './cost';
import * as transforms from '../transforms';


describe('Cost display component', () => {
  let displayElement: HTMLElement;
  let view: SummaryDataView<EnergySource>;

  beforeEach(() => {
    displayElement = document.createElement('p');
    document.body.appendChild(displayElement);
  });

  afterEach(() => {
    // Destroy the sandbox and its contents.
    displayElement.remove();
  });

  describe('TotalCost', () => {
    let totalCost: cost.TotalCost;

    beforeEach(() => {
      totalCost = new cost.TotalCost(displayElement);
      view = {
        summary: {
          cost: 1e5,
          co2: 0,
          energy: 200,
          breakdown: {
            solar: {cost: 100, energy: 50},
            wind: {cost: 0, energy: 50},
            nuclear: {cost: 0, energy: 100},
            ng: {cost: 0, energy: 0},
            coal: {cost: 0, energy: 0},
          }
        },
        population: 1000,
        baseline: {
          cost: 5e4,
          co2: 0,
          energy: 240,
          breakdown: null,
        },
        deltaToRef: null,
      };
      view.deltaToRef = transforms.deltas(view.baseline, view.summary);
    });

    it('after initial data view update', () => {
      totalCost.update(view);

      const mwhCost = transforms.perMWhCost(
          view.summary.cost, view.summary.energy);

      expect(displayElement.textContent).toEqual(`$${mwhCost.toFixed(2)}`);
    });

    it('after multiple data view updates', () => {
      totalCost.update(view);
      const newCost = 2e5;
      expect(newCost).not.toEqual(view.summary.cost);

      view.summary.cost = newCost;
      totalCost.update(view);

      const mwhCost = transforms.perMWhCost(newCost, view.summary.energy);
      expect(displayElement.textContent).toEqual(
        `$${mwhCost.toFixed(2)}`);
    });
  });

  describe('DeltaCost', () => {
    let deltaCost: cost.BaselineDeltaCost;

    beforeEach(() => {
      deltaCost= new cost.BaselineDeltaCost(displayElement);

      view = {
        summary: {
          cost: 100000,
          co2: 0,
          energy: 200,
          breakdown: {
            solar: {cost: 100, energy: 0},
            wind: {cost: 0, energy: 0},
            nuclear: {cost: 0, energy: 0},
            ng: {cost: 0, energy: 0},
            coal: {cost: 0, energy: 0},
          }
        },
        population: 10,
        baseline: {
          cost: 140000,
          co2: 0,
          energy: 240,
          breakdown: null,
        },
        deltaToRef: null,
      };
      view.deltaToRef = transforms.deltas(view.baseline, view.summary);
    });

    it('after initial data view update', () => {
      deltaCost.update(view);

      const baseline = transforms.perMWhCost(
          view.baseline.cost, view.baseline.energy);
      const scenario = transforms.perMWhCost(
          view.summary.cost, view.summary.energy);
      const delta = scenario - baseline;
      expect(displayElement.textContent).toEqual(
        `${delta < 0 ? '-' : ''}$${Math.abs(delta).toFixed(2)}`);
    });
  });
});