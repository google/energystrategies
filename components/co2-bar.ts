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

import * as style from '../style';
import * as formatters from '../formatters';
import * as util from '../util';


/**
 * Carbon emissions bar chart configuration options.
 */
interface ChartOptions {
  data?: {
    // The maximum CO2 value to display.
    max?: number,
    // Markers for CO2 emissions levels along the bar.
    // e.g., {label: 'Goal', value: <target emissions level>}
    markers?: {label: string, value: number}[]
  },
  // Dimensions of the CO2 bar (e.g., pixels).
  bar?: {width?: number, height?: number},
  // Padding around the bar to make room for ticks, labels, etc.
  padding?: {left?: number; top?: number; right?: number; bottom?: number},
  // Tick layout.
  ticks?: {
    // The length of each tick mark line.
    size?: number,
    // Size of the whitespace gap between the tick line and tick value.
    valueGap?: number,
    // Size of the whitespace gap between the tick label and tick value.
    labelGap?: number,
    // Tick text distance threshold for triggering text anchoring behavior.
    alignThreshold?: number,
    // How far to adjust the tick label offset relative to the anchor.
    //
    // For start-aligned text, this offset is negative; the offset is
    // positive for end-aligned.
    xOffset?: number,
  },
  text?: {
    // How far to adjust the title placement from its default position
    // (default is left-aligned within the bar itself).
    offset?: {x?: number, y?: number}
  },
  transition?: {delay?: number, duration?: number},
}

/**
 * The default configuration options for the co2 emissions bar chart.
 */
const DEFAULT_CONFIG: ChartOptions = {
  data: {
    max: 1,
    markers: [
      {value: 0, label: ''},
      {value: 1, label: ''},
      {value: .2, label: 'Goal'},
      {value: .6, label: 'Today'},
    ]
  },
  bar: {width: 270, height: 50},
  padding: {left: 10, right: 15, top: 6, bottom: 50},
  ticks: {size: 10, valueGap: 15, labelGap: 16, alignThreshold: 50, xOffset: 3},
  text: {offset: {x: 8, y: 6}},
  transition: {delay: 50, duration: 100}
};

/**
 * Chart that renders a co2 emissions level relative to specified goal.
 */
export class CO2GoalChart implements SummaryDataComponent<string> {
  _config: ChartOptions;

  // Static chart elements.
  _container: HTMLElement;
  _co2Scale: d3.scale.Linear<number, number>;
  _transition: d3.Transition<any>;

  // Dynamic chart elements.
  _bar: d3.Selection<any>;
  _text: d3.Selection<any>;

  /**
   * Constructor.
   *
   * @param container The container element for the chart.
   * @param view The initial data view that the chart should render.
   * @param configOverrides Any chart configuration overrides.
   */
  constructor(
      container: HTMLElement,
      view: SummaryDataView<string>,
      configOverrides: ChartOptions) {
    this._container = container;
    this._config = {};

    this._build(view, configOverrides);
  }

  /**
   * Updates the chart to render the given data view.
   *
   * @param view The data view to render.
   */
  update(view: SummaryDataView<string>) {
    // Update the length of the co2 emissions bar.
    this._bar
        .transition(<any>this._transition)
        .attr('width', this._co2Scale(view.summary.co2));
    // Update the current value display text.
    this._text
        .text(`${formatters.largeNumberFormatter(view.summary.co2)}t CO2/yr`);
  }

  /**
   * Configures and builds chart elements.
   *
   * @param view The initial data view to render.
   * @param configOverrides Any configuration overrides to apply.
   */
  _build(view: SummaryDataView<string>, configOverrides: ChartOptions) {
    // Configure chart properties.
    util.mergeDeep(DEFAULT_CONFIG, this._config);
    util.mergeDeep(configOverrides, this._config);
    this._configureLayout(view);

    // Create a top-level layer for containing all of the data-driven elements,
    // with proper whitespace margin/padding transforms applied.
    const dataLayer = this._createChart();
    this._createDataElements(dataLayer);

    // Render the chart for the initial data view.
    this.update(view);
  }

  /**
   * Configure the visual layout of the chart.
   *
   * @param view The data view used for deriving chart layout (e.g., scales).
   */
  _configureLayout(view: SummaryDataView<string>) {
    this._transition = d3.transition()
        .delay(this._config.transition.delay)
        .duration(this._config.transition.duration);

    // Map co2 value to bar width pixels
    this._co2Scale = d3.scale.linear()
        .nice()
        .domain([0, this._config.data.max])
        .rangeRound([0, this._config.bar.width]);
    // Prevent the bar from expanding beyond min/max
    this._co2Scale.clamp(true);
  };

  /**
   * Creates the static elements for the chart.
   */
  _createChart() {
    const container = d3.select(this._container)
        .classed('co2-chart-container', true);

    const pad = this._config.padding;
    const width = this._config.bar.width + pad.left + pad.right;
    const height = this._config.bar.height + pad.top + pad.bottom;
    const svg = container.append('svg')
        .classed('co2-chart', true)
        .style('margin-left', `-${pad.left}px`)
        .attr('width', width)
        .attr('height', height);

    // Create a group that we'll use for applying margins and padding.
    const dataLayer = svg.append('g')
        .classed('co2-chart-bar-group', true)
        .attr('transform', `translate(${pad.left},${pad.top})`);

    // Create the bounding box for the chart data.
    const box = dataLayer.append('rect')
        .classed('co2-chart-bar-box', true)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', this._config.bar.width)
        .attr('height', this._config.bar.height);

    return dataLayer;
  }

  /**
   * Creates the dynamic elements for the chart.
   *
   * @param parent The parent d3 selection in which elements should be created.
   */
  _createDataElements(parent: d3.Selection<any>) {
    // CO2 emissions level bar.
    this._bar = parent.append('rect')
        .classed('co2-chart-bar', true)
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', this._co2Scale(0))
        .attr('height', this._config.bar.height);

    // CO2 emissions display text.
    this._text = parent.append('text')
        .classed('co2-chart-title', true)
        .text('')
        // Center the title within the bar and add left-padding.
        .attr('x', this._config.padding.left + this._config.text.offset.x)
        // Vertically center the text within the bar and adjust the baseline.
        .attr('y', (this._config.bar.height / 2) + this._config.text.offset.y);

    // CO2 emissions reference point markers.
    const markers = parent
        .selectAll('.co2-chart-marker')
        .data(this._config.data.markers);
    markers.enter().append('g')
        .classed('.co2-chart-marker', true);
    // Note: need a different "this" context for doing the selection.each bit
    // below, because d3 chooses to pass the mapped DOM element via the
    // 'this' context rather than a callback argument; maintaining d3's
    // intended 'this' context is also why the callback is not a fat arrow.
    const self = this;
    markers.each(function (d, i) {
      // Here, the 'this' context is the DOM node mapped to the data value for
      // the current marker.
      self._createMarker(d3.select(this), d.value, d.label);
    });
  }

  /**
   * Creates a single co2 emissions level marker within the chart.
   *
   * @param parent The parent d3 selection in which elements should be created.
   * @param co2 The co2 emissions level to mark.
   * @param label The label for the given co2 level.
   */
  _createMarker(parent: d3.Selection<any>, co2: number, label: string) {
    // Compute the x-coordinate in pixels for the tick text endpoint
    // (relative to scale 0, which is bar start)
    const xCoord = this._co2Scale(co2);

    const layout = _getMarkerLayout(
        xCoord,
        this._config.ticks.alignThreshold,
        this._config.ticks.xOffset,
        this._config.bar.width);

    const tickLine = parent.append('line')
        .classed('co2-chart-ticks-tick', true)
        .attr('x1', d => this._co2Scale(d.value))
        .attr('x2', d => this._co2Scale(d.value))
        .attr('y1', this._config.bar.height)
        .attr('y2', this._config.bar.height + this._config.ticks.size);

    // Add padding between the tick line and the tick value.
    const tickValuePlacement = this._config.bar.height
        + this._config.ticks.size
        + this._config.ticks.valueGap;
    const tickValue = parent.append('text')
        .classed('co2-chart-ticks-value', true)
        .attr('text-anchor', layout.anchor)
        .attr('x', d => this._co2Scale(d.value) + layout.offset)
        .attr('y', tickValuePlacement)
        .text(formatters.largeNumberFormatter(co2));

    // Padding between tick "value" text and tick's "name" text.
    const tickLabel = parent.append('text')
        .classed('co2-chart-ticks-name', true)
        .text(d => d.label)
        .attr('text-anchor', 'middle')
        .attr('x', d => this._co2Scale(d.value))
        .attr('y', () => tickValuePlacement + this._config.ticks.labelGap);
  }
}

/**
 * Gets the visual layout for a single marker.
 *
 * @param x The x-coordinate (in canvas space) that the marker will describe.
 * @param threshold The distance threshold for label text alignment.
 * @param offsetDistance The additional offset distance for start/end.
 * @param maxPlacement The maximum x-coordinate value to place; the minimum is
 *   assumed to be zero.
 */
export function _getMarkerLayout(
    x: number,
    threshold: number,
    offsetDistance: number,
    maxPlacement: number) {

  let anchor;
  let offset;
  if (x < threshold) {
    anchor = 'start';
    offset = -offsetDistance;
  } else if (x > (maxPlacement - threshold)) {
    anchor = 'end';
    offset = +offsetDistance;
  } else {
    anchor = 'middle';
    offset = 0;
  }

  return {
    anchor: anchor,
    offset: offset,
  };
}