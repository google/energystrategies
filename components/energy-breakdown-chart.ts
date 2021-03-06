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

import * as style from '../style';


/**
 * Contribution breakdown by energy source chart.
 */
class EnergyBreakdownChart implements SummaryDataComponent {
  _container: HTMLElement;
  _chart: c3.ChartAPI;

  // Defines the deterministic ordering of data series within the chart.
  _dataOrder = ['nuclear', 'solar', 'wind', 'ng', 'storage'];

  /**
   * Constructor.
   *
   * @param container The container element for the chart.
   * @param title The title for the chart.
   */
  constructor(container: HTMLElement, title: string) {
    this._container = container;
    this._chart = c3.generate(this._getChartConfig(title));
  }

  /**
   * Updates the chart to display a new data view.
   *
   * @param view The new data view to render.
   */
  update(view: SummaryDataView) {
    const columns: any[][] = [];

    this._dataOrder.forEach(key => {
      if (view.summary.breakdown[key]) {
        columns.push(
          [key].concat(<any[]>[
            this._getEnergySourceValue(view.summary.breakdown[key])
          ])
        );
      }
    });

    this._chart.load({
      columns: columns
    });
  }

  /**
   * Gets the representative value for a given energy source.
   *
   * @param energySource The outcome contributions for a single energy source.
   * @returns A representative numeric value for the energy source; e.g., cost.
   */
  _getEnergySourceValue(energySource: EnergySourceOutcome): number {
    throw new Error('Not implemented: abstract.');
  }

  /**
   * Gets the chart configuration.
   *
   * @param title A title for the chart.
   * @returns A C3 chart configuration object.
   */
  _getChartConfig(title: string): c3.ChartConfiguration {
    return {
      bindto: this._container,
      data: {
        columns: [],
        type: 'donut',
        order: null,
        names: {
          solar: 'Solar',
          wind: 'Wind',
          nuclear: 'Nuclear',
          ng: 'Natural Gas',
          storage: 'Storage',
        },
        colors: {
          solar: style.COLORS.SOLAR,
          wind: style.COLORS.WIND,
          nuclear: style.COLORS.NUCLEAR,
          ng: style.COLORS.NG,
          storage: style.COLORS.PRIMARY,
        },
      },
      donut: {
        title: title,
        label: {
          show: false,
        }
      },
      legend: {
        show: false,
      },
      transition: {
        duration: 20,
      },
    };
  }
}


/**
 * Chart that displays the energy generated broken down by energy source.
 */
export class GenerationBreakdownChart extends EnergyBreakdownChart {
  /**
   * Constructor.
   *
   * @param container The container element for the chart.
   */
  constructor(container: HTMLElement) {
    super(container, 'Energy');
  }

  /**
   * Gets the energy generated by a given energy source.
   *
   * @param energySource The outcome contributions for a single energy source.
   * @returns The amount of energy generated by the energy source.
   */
  _getEnergySourceValue(energySource: EnergySourceOutcome): number {
    return energySource.energy;
  }
}

/**
 * Chart that displays the scenario cost broken down by energy source.
 */
export class CostBreakdownChart extends EnergyBreakdownChart {
  /**
   * Constructor.
   *
   * @param container The container element for the chart.
   */
  constructor(container: HTMLElement) {
    super(container, 'Cost');
  }

  /**
   * Gets the total cost incurred by a given energy source.
   *
   * @param energySource The outcome contributions for a single energy source.
   * @returns The total cost incurred by the energy source.
   */
  _getEnergySourceValue(energySource: EnergySourceOutcome): number {
    return energySource.fixedCost + energySource.variableCost;
  }
}