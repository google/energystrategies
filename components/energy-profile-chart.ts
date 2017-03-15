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

import {COLORS} from '../style';
import * as util from '../util';
import * as formatters from '../formatters';


/**
 * Energy profile chart for displaying supply and demand over time.
 */
export class EnergyProfileChart implements UtilityDataComponent {
  element: HTMLElement;
  chart: c3.ChartAPI;

  // Defines the stacking order of the energy profile area charts.
  //
  // Ordering implies: [bottom, ..., top].
  areaStackingOrder = [
    'nuclear',
    'coal',
    'solar',
    'wind',
    'ng',
    'unmet'
  ];

  /**
   * Constructor.
   *
   * @param element The container element for the chart.
   * @param view The initial data view to render.
   */
  constructor(element: HTMLElement, view: UtilityDataView) {
    this.element = element;
    this.chart = null;

    this._build(view);
  }

  /**
   * Update the chart to display a new data view.
   *
   * @param view The new data view to render.
   */
  update(view: UtilityDataView) {
    console.debug('utility profiles chart update');

    const columns: any[][] = [
      ['time'].concat(<any[]>view.profiles.index),
    ];

    this.areaStackingOrder.forEach(key => {
      columns.push(
        [key].concat(<any[]>view.profiles.series[key])
      );
    });

    this.chart.load({
      columns: columns
    });
  }

  /**
   * Constructs the chart within the container element.
   *
   * @param view The initial data view to render.
   */
  _build(view) {
    const maxDemand = util.max(view.profiles.series.demand);

    const config = {
      bindto: this.element,
      data: {
        x: 'time',
        columns: [],
        types: {
          solar: 'area',
          wind: 'area',
          nuclear: 'area',
          ng: 'area',
          coal: 'area',
          unmet: 'area',
        },
        groups: [
          ['solar', 'wind', 'nuclear', 'ng', 'coal', 'unmet'],
        ],
        names: {
          solar: 'Solar',
          wind: 'Wind',
          nuclear: 'Nuclear',
          ng: 'Natural Gas',
          unmet: 'Unmet demand',
          time: 'Time',
          coal: 'Coal',
        },
        order: null,
        colors: {
          solar: COLORS.SOLAR,
          wind: COLORS.WIND,
          nuclear: COLORS.NUCLEAR,
          ng: COLORS.NG,
          unmet: COLORS.FAILURE,
          coal: COLORS.COAL,
        },
      },
      point: {
        show: false
      },
      grid: {
        y: {
          lines: [
            {
              value: maxDemand,
              text: '100% of Peak Hourly Demand',
              position: 'middle',
            },
          ]
        }
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%m/%d',
            count: 7,
            culling: {
              max: 14
            },
            fit: true,
          }
        },
        y: {
          max: maxDemand,
          tick: {
            values: [0, 0.25, 0.5, 0.75, 1.0, 1.25].map(x => x * maxDemand),
            format: x => formatters.percentFormatter(x / maxDemand),
          },
          label: {
            text: 'Percentage of max weekly demand',
            position: 'inner-top',
          }
        },
      },
      padding: {
        // Pad chart region to avoid clipping the far-right x-axis tick label.
        right: 24,
      },
      transition: {
        // Disable transition animations.
        duration: 0
      }
    };
    this.chart = c3.generate(<any>config);
  }
}