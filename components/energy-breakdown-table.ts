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

import * as config from '../policy-mode/config';
import * as transforms from '../transforms';
import * as formatters from '../formatters';
import * as style from '../style';


/**
 * Policy outcome breakdown table comparing per-resource cost and energy.
 */
export class PolicyBreakdownTable implements PolicyDataComponent {

  // Container element for the comps table viz.
  _container: HTMLElement;
  // Layer that contains the table data view.
  _table: d3.Selection<any>;
  _displayNames: PolicyBreakdownDisplayNames;
  _order: PolicyBreakdownEntry[];

  /**
   * Constructor.
   *
   * @param container The container element for the chart.
   * @param view The initial data view that the chart should render.
   */
  constructor(
      container: HTMLElement,
      view: PolicyDataView,
      order: PolicyBreakdownEntry[],
      displayNames: PolicyBreakdownDisplayNames) {

    this._container = container;
    this._order = order;
    this._displayNames = displayNames;

    this._build(view);
  }

  /**
   * Configures and builds chart elements.
   *
   * @param view The initial data view to render.
   */
  _build(view: PolicyDataView) {
    const container = d3.select(this._container)
        .classed('policy-breakdown-table-container', true);
    this._table = container.append('table')
        .classed('policy-breakdown-table-table', true);

    // Render the chart for the initial data view.
    this.update(view);
  }

  /**
   * Updates the chart to render the given data view.
   *
   * @param view The data view to render.
   */
  update(view: PolicyDataView) {
    // Extract a tabular dataset from the comparison data view.
    const layout = getBreakdownTableLayout(
        view, this._order, this._displayNames);

    // Render each of the comparison rows.
    const ROW_CSS = 'policy-breakdown-table-row'
    const rows = this._table
        .selectAll(`.${ROW_CSS}`)
        .data(layout);
    rows.enter().append('tr')
        .classed(ROW_CSS, true);
    // Drop any rows that are unnecessary.
    rows.exit().remove();

    // Assign row-level css classes based upon the row type.
    rows.classed('header', d => d.type == 'header');
    rows.classed('body', d => d.type == 'body');
    rows.classed('footer', d => d.type == 'footer');
    // Update the cells within each row.
    const self = this;
    rows.each(function (rowData, i) {
      // Here, the 'this' context is the DOM node mapped to the data value for
      // the current marker.
      self._updateRow(d3.select(this), rowData);
    });
  }

  /**
   * Updates a single header row of text elements.
   *
   * @param row The parent d3 selection in which elements should be created.
   * @param rowData A single row of header labels to be displayed.
   */
  _updateRow(row: d3.Selection<any>, rowData: PolicyBreakdownRowLayout) {
    const TITLE_CSS = 'title';
    const titleCells = row
        .selectAll(`td.${TITLE_CSS}`)
        .data([rowData]);
    titleCells.enter().append('td')
        .classed(TITLE_CSS, true);
    titleCells.exit().remove();
    titleCells
        .text(d => d.title)
        .style('color', d => config.BREAKDOWN_COLORS[d.source] || 'inherit');

    const VALUE_CSS = 'value';
    const valueCells = row
        .selectAll(`td.${VALUE_CSS}`)
        .data(rowData.values);
    valueCells.enter().append('td')
        .classed(VALUE_CSS, true);
    valueCells.exit().remove();
    valueCells.text(d => d);
  }
}

interface PolicyBreakdownRowLayout {
  type: 'body' | 'header' | 'footer';
  source: PolicyBreakdownEntry,
  // Table row title  e.g., "Solar" | "Nuclear"
  title: string,
  // All values for the remaining non-title cells
  values: string[],
}

/**
 * Generates the content layout for a  breakdown table.
 *
 * @param view A policy outcome data view.
 * @param sources Policy breakdown source names; e.g., ['solar', 'coal'].
 * @param sourceDisplayNames Display names to use for each of the sources.
 * @returns A sequence of row content layouts.
 */
export function getBreakdownTableLayout(
    view: PolicyDataView,
    sources: PolicyBreakdownEntry[],
    sourceDisplayNames: {[K in PolicyBreakdownEntry]?: string},
    ): PolicyBreakdownRowLayout[] {

  const rows: PolicyBreakdownRowLayout[] = [];
  rows.push({
    type: 'header',
    source: null,
    title: 'Sources',
    values: ['Energy', 'Cost']
  });

  sources.forEach(source => {
    rows.push({
      type: 'body',
      source: source,
      title: sourceDisplayNames[source] || source,
      values: [
        getDisplayEnergyContribution(view, source),
        formatters.currencyFormatter(
            transforms.resourceCost(view, source)),
      ]
    });
  });

  rows.push({
    type: 'footer',
    source: null,
    title: 'Total',
    values: [
      '1.00 MWh',
      formatters.currencyFormatter(transforms.totalCost(view)),
    ]
  })

  return rows;
}

/**
 * Gets the energy contribution as a formatter display string.
 *
 * @param view The policy outcome data view.
 * @param source
 */
function getDisplayEnergyContribution(
    view: PolicyDataView, source: PolicyBreakdownEntry) {
  // Storage does not contribute towards energy generation.
  if (source == 'storage') {
    return '-';
  }
  const fraction = transforms.energyFraction(view, source);
  return formatters.fractionMWhFormatter(fraction);
}


