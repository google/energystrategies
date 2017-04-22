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
import * as src from './energy-profiles';


describe('EnergyProfileChart', () => {
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
  let chart: src.SupplyDemandProfilesChart;

  beforeEach(() => {

    view = {
      profiles: {
        index: [
          1441108800000,  // Day 0
          1441195200000,  // Day 1
          1441281600000,  // Day 2
        ],
        units: 'MW',
        series: {
          demand: [10, 12, 20],
          unmet: [0, 0, 5],
          supply: [0+3+2+5+0, 8+5+2+0+0, 0+7+2+6+0],
          solar: [0, 8, 0],
          wind: [3, 5, 7],
          nuclear: [2, 2, 2],
          ng: [5, 0, 6],
          coal: [0, 0, 0],
        }
      },

      allocations: null,

      summary: {
        cost: 1e5,
        co2: 0,
        energy: 0,
        breakdown: {
          solar: {cost: 100, energy: 0},
          wind: {cost: 0, energy: 0},
          nuclear: {cost: 0, energy: 0},
          ng: {cost: 0, energy: 0},
          coal: {cost: 0, energy: 0},
        }
      },
      population: 1000,
      baseline: {
        cost: 5e4,
        co2: 0,
        energy: 50,
        breakdown: null,
      },
      deltaToRef: null,
    };
    view.deltaToRef = util.deltas(view.baseline, view.summary);
  });

  it('after initial data view update', () => {
    const config = {
      size: {width: 400, height: 200},
      padding: {top: 5, right: 0, bottom: 10, left: 0}
    };
    chart = new src.SupplyDemandProfilesChart(displayElement, view, config);
    chart.update(view);

    const svgSelection = d3.select(displayElement).select('svg');
    expect(svgSelection.attr('width')).toBe(String(400 + 0 + 0));
    expect(svgSelection.attr('height')).toBe(String(200 + 5 + 10));
  });

  it('getExcessLayout', () => {
    const series = src.getExcessLayout(view);

    expect(series.length).toEqual(3);
    expect(series[0]).toEqual({
      x: new Date(view.profiles.index[0]),
      y0: view.profiles.series.demand[0],
      y1: view.profiles.series.supply[0],
      defined: true,
    });
    expect(series[1]).toEqual({
      x: new Date(view.profiles.index[1]),
      y0: view.profiles.series.demand[1],
      y1: view.profiles.series.supply[1],
      defined: true,
    });
    expect(series[2]).toEqual({
      x: new Date(view.profiles.index[2]),
      y0: view.profiles.series.demand[2],
      y1: view.profiles.series.supply[2],
      defined: true,
    });
  });

  it('getConsumedLayout', () => {
    const series = src.getConsumedLayout(view);

    expect(series.length).toEqual(3);
    expect(series[0]).toEqual({
      x: new Date(view.profiles.index[0]),
      y: 10,
      defined: true,
    });
    expect(series[1]).toEqual({
      x: new Date(view.profiles.index[1]),
      y: 12,
      defined: true,
    });
    expect(series[2]).toEqual({
      x: new Date(view.profiles.index[2]),
      y: 15,
      defined: true,
    });
  });
});

describe('Chart axis ticks', () => {
  it('for time axis', () => {
    const times = [
      1441108800000, // UTC noon day 0
      1441112400000,
      1441116000000,
      1441188000000,
      1441191600000,
      1441195200000, // UTC noon day 1
      1441198800000,
      1441274400000,
      1441278000000,
      1441281600000, // UTC noon day 2
      1441285200000,
    ].map(t => new Date(t));
    const ticks = src._getTimeScaleTicks(times);

    expect(ticks).toEqual([
      1441108800000,  // Day 0
      1441195200000,  // Day 1
      1441281600000,  // Day 2
    ].map(t => new Date(t)));
  });

  it('when no desirable time axis placements can be found', () => {
    // These are all non-noon times.
    const times = [
      1441112400000,
      1441116000000,
      1441188000000,
      1441191600000,
      1441198800000,
      1441274400000,
      1441278000000,
      1441285200000,
    ].map(t => new Date(t));

    expect(() => src._getTimeScaleTicks(times)).toThrow();
  });

  it('for power axis', () => {
    const demand = [
      2123,
      3234,
      2234,
      3324,
      4234,
      5234,
      9123,
      3234,
      5234
    ];
    const ticks = src._getPowerScaleTicks(demand);
    expect(ticks).toEqual([0, 2000, 9000]);
  });
});

describe('Excess marker layout', () => {
  let profiles: ProfileDataset;

  beforeEach(() => {
    profiles = {
      index: [0, 1, 2],
      units: null,
      series: {
        demand: [10, 10, 10],
        supply: [8, 9, 10],
        unmet: null,
        solar: null,
        wind: null,
        coal: null,
        nuclear: null,
        ng: null
      }
    };
  });

  it('when there is no excess.', () => {
    const markers = src.getExcessMarkerLayout(profiles, 3, 20);
    expect(markers.length).toBe(0);
  });

  it('when there are multiple points of excess.', () => {
    profiles.series.supply = [12, 7, 15];
    const markers = src.getExcessMarkerLayout(profiles, 3, 20);

    // Should have found the peak excess point.
    expect(markers.length).toBe(1);
    expect(markers[0]).toEqual({
      excessValue: 5,
      placementValue: 15,
      timestamp: new Date(2),
    });
  });

  it('when excess exists, but is all below show threshold.', () => {
    profiles.series.supply = [10, 11, 12];
    const markers = src.getExcessMarkerLayout(profiles, 3, 20);

    // Excess exists in multiple spots, but all below the threshold.
    expect(markers.length).toBe(0);
  });

  it('when excess power value exceeds the chart bounds.', () => {
    profiles.series.supply = [10, 30, 20];
    const markers = src.getExcessMarkerLayout(profiles, 3, 20);

    // The excess marker should appear at the peak location, but be placed
    // at the specified height "ceiling" because the peak value exceeds the
    // ceiling.
    expect(markers.length).toBe(1);
    expect(markers[0]).toEqual({
      excessValue: 20,
      placementValue: 20,
      timestamp: new Date(1),
    });
  });
});

describe('Piecewise curve and region helper', () => {
  it('defines endpoints around singleton point', () => {
    const series = [
      {defined: false},
      {defined: false},
      {defined: true},
      {defined: false},
      {defined: false},
    ];
    src.defineIntervalEndpoints(series);

    expect(series.map(s => s.defined)).toEqual([
      false,
      true,
      true,
      true,
      false,
    ]);
  });

  it('defines endpoints around singleton point at beginning', () => {
    const series = [
      {defined: true},
      {defined: false},
      {defined: false},
    ];
    src.defineIntervalEndpoints(series);

    expect(series.map(s => s.defined)).toEqual([
      true,
      true,
      false,
    ]);
  });

  it('defines endpoints around singleton point at end', () => {
    const series = [
      {defined: false},
      {defined: false},
      {defined: true},
    ];
    src.defineIntervalEndpoints(series);

    expect(series.map(s => s.defined)).toEqual([
      false,
      true,
      true,
    ]);
  });

  it('defines endpoints around multiple open intervals', () => {
    const series = [
      {defined: false},
      {defined: false},
      {defined: true},
      {defined: false},
      {defined: false},  // should remain false
      {defined: false},
      {defined: true},
      {defined: false},
      {defined: false},
    ];
    src.defineIntervalEndpoints(series);

    expect(series.map(s => s.defined)).toEqual([
      false,
      true,
      true,
      true,
      false,
      true,
      true,
      true,
      false,
    ]);
  })

  it('defines no endpoints when no open intervals exist', () => {
    const series = [
      {defined: false},
      {defined: false},
      {defined: false},
    ];
    src.defineIntervalEndpoints(series);

    expect(series.map(s => s.defined)).toEqual([
      false,
      false,
      false,
    ]);
  });
});

describe('SVG pattern helpers', () => {
  let displayElement: HTMLElement;
  let defs: d3.Selection<any>;
  let view: UtilityDataView;

  beforeEach(() => {
    displayElement = document.createElement('div');
    document.body.appendChild(displayElement);
    defs = d3.select(displayElement).append('svg').append('defs');
  });
  afterEach(() => {
    // Destroy the sandbox and its contents.
    displayElement.remove();
  });

  it('creates a solid pattern', () => {
    const pattern = src._createSolidPattern(defs, 'foo-bar', 'steelblue');

    expect(pattern.attr('id')).toBe('foo-bar');
    expect(pattern.attr('patternUnits')).toBe('userSpaceOnUse');
    expect(pattern.selectAll('rect').size()).toBe(1);
    expect(pattern.select('rect').attr('fill')).toBe('steelblue');
  });

  it('creates a speckled pattern', () => {
    const pattern = src._createSpeckledPattern(defs, 'foo-bar', 'red', 'black');

    expect(pattern.attr('id')).toBe('foo-bar');
    expect(pattern.attr('patternUnits')).toBe('userSpaceOnUse');
    // There should be two rects, one for the foreground color and one for the
    // background color.
    const rects = pattern.selectAll('rect')[0];
    expect(rects.length).toBe(2);
    // Foreground should come before background (ordering matters).
    expect(d3.select(rects[0]).attr('fill')).toBe('red');
    expect(d3.select(rects[1]).attr('fill')).toBe('black');
  });
});
