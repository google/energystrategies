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

import * as src from './co2-bar';

describe('CO2 emissions bar chart', () => {
  let displayElement: HTMLElement;
  let view: UtilityDataView;

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
      summary: {
        co2: 0,
        cost: 0,
        energy: 0,
        breakdown: null,
      },
      profiles: null,
      allocations: null,
      population: null,
      baseline: null,
      deltaToRef: null,
    };
  });

  it('initialization', () => {
    const chart = new src.CO2GoalChart(displayElement, view, {});
    chart.update(view);

    const svg = d3.select(displayElement).select('svg');
    expect(svg.attr('width')).toBe('295');
    expect(svg.attr('height')).toBe('106');
  });
});

describe('Marker layout', () => {
  it('when marker is on the far left', () => {
    expect(src._getMarkerLayout(6, 10, 7, 100)).toEqual({
      anchor: 'start',
      offset: -7,
    });
  });

  it('when marker is at the midpoint', () => {
    expect(src._getMarkerLayout(50, 10, 7, 100)).toEqual({
      anchor: 'middle',
      offset: 0,
    });
  });

  it('when marker is on the far right', () => {
    expect(src._getMarkerLayout(96, 10, 7, 100)).toEqual({
      anchor: 'end',
      offset: +7,
    });
  });
});