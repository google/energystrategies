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

/// <reference path="../c3.d.ts" />
/// <reference path="../dataset.d.ts" />

import * as style from '../style.ts';
import * as formatters from '../formatters.ts';


/**
 * Scenario outcome total cost goal progress chart.
 *
 * Displays the total cost of a scenario along with cost goal thresholds.
 */
export class ScenarioCostGoalChart implements DatasetSelectionView {
  element: HTMLElement;
  chart: c3.ChartAPI;

  /**
   * Constructor.
   *
   * @param element The container element for the chart.
   * @param view The initial data view used to drive the chart.
   */
  constructor(element: HTMLElement, view: PlaygroundState) {
    this.element = element;
    this.chart = this._build(view)
  }

  /**
   * Updates the chart to match the given data view.
   *
   * @param view An updated data view used to drive the chart.
   */
  update(view: PlaygroundState) {
    this.chart.load(this._getDataViewConfig(view));
  }

  _getDataViewConfig(view: PlaygroundState) {
    return {
      columns: [
        ['Cost', view.deltaToRef.cost],
      ],
    };
  }

  _build(view: PlaygroundState) {
    const dataConfig = this._getDataViewConfig(view);
    const config: ExtendedChartConfiguration = {
      bindto: this.element,
      size: style.SCENARIO_GOAL_CHART_SIZE,
      data: {
        columns: dataConfig.columns,
        type: 'bar',
        colors: {
          Cost: style.COLORS.ACCENT_PRIMARY
        }
      },
      axis: {
        x: {
          show: false
        },
        y: {
          label: {
            text: 'Percent change from today\'s cost',
            position: 'outer-middle',
          },
          max: 2.5,
          min: -0.30,
          tick: {
            format: formatters.percentFormatter,
          },

        }
      },
      regions: [
        {
          axis: 'y',
          start: -1.0,
          end: 0.05,
          class: style.SCENARIO_GOAL_CSS.GOOD,
          opacity: 1,
        },
        {
          axis: 'y',
          start: 0.05,
          end: 0.20,
          class: style.SCENARIO_GOAL_CSS.OK,
          opacity: 1,
        },
        {
          axis: 'y',
          start: 0.20,
          end: 2.5,
          class: style.SCENARIO_GOAL_CSS.BAD,
          opacity: 1,
        },
      ],
      grid: {
        y: {
          lines: [
            {
              value: 0.0,
              text: 'Today\'s Cost',
              position: 'middle',
              class: style.SCENARIO_GOAL_THRESHOLD_CSS,
            },
          ]
        }
      },
      legend: {
        hide: true
      },
      zoom: {
        enabled: false
      }
    };

    return c3.generate(config);
  }
}