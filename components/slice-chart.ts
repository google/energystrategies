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
/// <reference path="../dataset.d.ts" />

import {COLORS} from '../style';
import * as util from '../util';

/**
 * A dynamic chart that renders dataset slices.
 */
export class SliceChart implements DatasetSelectionView {

  view: DatasetSelection;
  dimension: string;
  containerSelection: d3.Selection<any>;
  chart: c3.ChartAPI;

  constructor(
      view: DatasetSelection,
      dimension: string,
      containerSelection: d3.Selection<any>) {
    this.view = view;
    this.dimension = dimension;
    this.containerSelection = containerSelection;

    // Create the chart and initialize to the current view.
    this.chart = this._build();
  }

  update(newView: DatasetSelection) {
    this.view = newView;
    this.chart.load(this._getDataViewConfig());
  }

  _build() {
    // Use the current view as the initial chart dataset.
    const dataConfig = this._getDataViewConfig();
    const numTicks = 6;
    const config: c3.ChartConfiguration = {
      bindto: this.containerSelection,
      size: {
        width: 650,
        height: 200,
      },
      padding: {
        left: 50,
        right: 70,
      },
      data: {
        columns: dataConfig.columns,
        type: 'bar',
        types: {
          cost: 'spline',
        },
        axes: {
          co2: 'y',
          cost: 'y2',
        },
        color: this._color.bind(this),
      },
      axis: {
        x: {
          show: false,
        },
        y: {
          label: {
            text: 'CO2 created (tonnes/year)',
            position: 'outer-top',
          },
          tick: {
            count: numTicks,
            format: d3.format('.2s'),
          },
        },
        y2: {
          label: {
            text: 'Household $/month (USD)',
            position: 'outer-top',
          },
          show: true,
          tick: {
            count: numTicks,
            format: d3.format(' $,.2s'),
          }
        }
      },
      bar: {
        width: {
          ratio: 0.95
        },
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

  _color(_: any, dataItem: any) {
    let scenarioLevel = this.view.scenario[this.dimension];

    // Color the bar and line differently for the value matching the
    // current scenario.
    if (dataItem.id == 'cost') {
      return dataItem.x == scenarioLevel ?
          COLORS.WHITE :
          COLORS.BLACK;
    } else if (dataItem.id == 'co2') {
      return dataItem.x == scenarioLevel ?
          COLORS.PRIMARY :
          COLORS.LIGHT_GRAY;
    }
  }

  _getDataViewConfig() {
    const sweep = this._getSweep();
    const costSeries: any[] = sweep.scenarios.map(
      s => util.asMonthlyPerHouseholdCost(s.cost));
    const co2Series: any[] = sweep.scenarios.map(s => s.co2);

    return {
      columns: [
        ['co2'].concat(co2Series),
        ['cost'].concat(costSeries),
      ],
    };
  }

  _getScenarioLevel() {
    return this.view.scenario[this.dimension];
  }

  _getSweep() {
    return this.view.slices[this.dimension];
  }
}
