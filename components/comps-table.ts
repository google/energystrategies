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

import * as style from '../style';
import * as formatters from '../formatters';
import * as util from '../util';


/**
 * A comparison table of policy choices and their outcomes.
 */
export class CompsTable implements CompareDataComponent {

  // Container element for the comps table viz.
  _container: HTMLElement;
  // Layer that contains the table data view.
  _table: d3.Selection<any>;
  _fields: PolicyFieldExtractor[];
  _comps: string[];
  _referenceDisplayNames: CompareDisplayPolicyNames;
  _title: string;

  /**
   * Constructor.
   *
   * @param container The container element for the chart.
   * @param view The initial data view that the chart should render.
   * @param comps The identifiers of the comparison policies to render.
   * @param fields The sequence of fields to render for each policy.
   * @param compDisplayNames The display names to use for each comp policy.
   * @param title The display name for the whole table.
   */
  constructor(
      container: HTMLElement,
      view: CompareDataView,
      comps: string[],
      fields: PolicyFieldExtractor[],
      compDisplayNames: CompareDisplayPolicyNames,
      title: string) {

    this._container = container;
    this._fields = fields;
    this._comps = comps;
    this._referenceDisplayNames = compDisplayNames;
    this._title = title;

    this._build(view);
  }

  /**
   * Configures and builds chart elements.
   *
   * @param view The initial data view to render.
   */
  _build(view: CompareDataView) {
    // Create a top-level layer for containing all of the data-driven elements,
    // with proper whitespace margin/padding transforms applied.
    const container = d3.select(this._container)
        .classed('comps-table-container', true);
    this._table = container.append('table')
        .classed('comps-table-table', true);

    // Render the chart for the initial data view.
    this.update(view);
  }

  /**
   * Updates the table component to render the latest data view.
   *
   * @param view The compare mode data view to render within the table.
   */
  update(view: CompareDataView) {
    this._updateHeader(this._table, view);

    // Render each of the comparison rows.
    const ROW_CSS = 'comps-table-row'
    const rows = this._table
        .selectAll(`.${ROW_CSS}`)
        .data(this._fields);
    rows.enter().append('tr')
        .classed(ROW_CSS, true);
    // Drop any rows that are unnecessary.
    rows.exit().remove();

    // Update the cells within each row.
    const self = this;
    rows.each(function(field, i) {
      // Here, the 'this' context is the DOM node mapped to the data value for
      // the current marker.
      self._updateRow(d3.select(this), view, field);
    });
  }

  /**
   * Updates a single header row of text elements.
   *
   * @param row The parent d3 selection in which elements should be created.
   * @param view The compare data view to render.
   * @param field The policy field configuration for extracting per-policy cell
   *     values.
   */
  _updateRow(
      row: d3.Selection<any>,
      view: CompareDataView,
      field: PolicyFieldExtractor) {

    // Update the row-level title cell.
    const TITLE_CSS = 'title';
    const titleCells = row
        .selectAll(`td.${TITLE_CSS}`)
        .data([field]);
    titleCells.enter().append('td')
        .classed(TITLE_CSS, true);
    titleCells.exit().remove();
    titleCells.text(d => d.title);

    // Update the cell corresponding to the user selected policy.
    const userValue = field.extractor(view.selection);
    const userData = {
      value: userValue,
      displayValue: field.formatter(userValue),
    };
    const USER_CSS = 'user';
    const userCells = row
        .selectAll(`td.${USER_CSS}`)
        .data([userData]);
    userCells.enter().append('td')
        .classed(USER_CSS, true);
    userCells.exit().remove();
    userCells.text(d => d.displayValue);

    // Update the cells corresponding to compared policies.
    const compValues = this._comps.map(comp => {
      const value = field.extractor(view.comps[comp]);
      return {value: value, displayValue: field.formatter(value)};
    });
    const COMPS_CSS = 'comps';
    const compCells = row
        .selectAll(`td.${COMPS_CSS}`)
        .data(compValues);
    compCells.enter().append('td')
        .classed(COMPS_CSS, true);
    compCells.exit().remove();
    compCells.text(d => d.displayValue);
  }

  /**
   * Updates the header row for the table with the current view.
   *
   * @param table The table d3 selection in which the header row will live.
   * @param view The compare data view to render.
   */
  _updateHeader(table: d3.Selection<any>, view: CompareDataView) {
    // Generate the sequence of display strings to render for the header row.
    const compDisplayNames = this._comps
        .map(comp => this._referenceDisplayNames[comp]);
    const columnDisplayValues = [this._title, 'Your policy']
        .concat(compDisplayNames);

    // Update all header cells.
    const ROW_CSS = 'comps-table-row';
    const HEADER_ROW_CSS = `${ROW_CSS}-header`;
    const headerRows = table
        .selectAll(`tr.${HEADER_ROW_CSS}`)
        .data([columnDisplayValues]);
    headerRows.enter().append('tr')
        .classed(HEADER_ROW_CSS, true);
    headerRows.exit().remove();
    headerRows.each(function (rowData, i) {
      const headerCells = d3.select(this).selectAll('td').data(rowData);
      headerCells.enter().append('td');
      headerCells.exit().remove();
      headerCells
          .text(compName => compName)
          .classed('column-name', d => !!d);
    });
  }
}
