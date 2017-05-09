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
import * as util from '../util';

/**
 * Energy supply and demand chart configuration options.
 */
interface ChartOptions {
  size?: {width?: number, height?: number},
  padding?: {top?: number, left?: number, bottom?: number, right?: number},
  labels?: {yAxis?: string, excessMarker?: string}
  layout?: {
    markers?: {labelYOffset?: number, labelYGap?: number, labelMaxYValue?: number}
  },
  behavior?: {showExcessLabelThreshold?: number},
  colors?: {[s: string]: string}
  transition?: {delay?: number, duration?: number},
  patterns?: {[s: string]: string},
  stackingOrder?: UtilityEnergySource[],
}

/**
 * The default configuration options for the energy profiles chart.
 */
const DEFAULT_CONFIG: ChartOptions = {
  size: {width: 760, height: 330},
  padding: {top: 5, left: 50, bottom: 30, right: 0},
  labels: {yAxis: 'Power (MegaWatts)', excessMarker: 'Excess'},
  layout: {
    markers: {labelYOffset: -12, labelYGap: -6, labelMaxYValue: 28000}
  },
  behavior: {showExcessLabelThreshold: 5000},
  colors: {
    solar: style.COLORS.SOLAR_LIGHT,
    wind: style.COLORS.WIND,
    nuclear: style.COLORS.NUCLEAR,
    ng: style.COLORS.NG,
    ngccs: style.COLORS.NGCCS,
    coal: style.COLORS.COAL,
    coalccs: style.COLORS.COALCCS,
    demand: style.COLORS.DEMAND,
    excess: style.COLORS.EXCESS,
    patternBackground: style.COLORS.EXCESS_LIGHT,
    markers: '#ccc',
  },
  transition: {delay: 50, duration: 100},
  patterns: {
    solar: 'solar-consumed',
    wind: 'wind-consumed',
    nuclear: 'nuclear-consumed',
    ng: 'ng-consumed',
    ngccs: 'ngccs-consumed',
    coal: 'coal-consumed',
    coalccs: 'coalccs-consumed',
    demand: 'demand-primary',
    excess: 'excess-primary',
  },
  stackingOrder: ['coal', 'coalccs', 'nuclear', 'solar', 'wind', 'ng', 'ngccs'],
};

/**
 * Chart that renders energy supply and demand over time.
 */
export class SupplyDemandProfilesChart implements UtilityDataComponent {
  _config: ChartOptions;

  // Static chart elements.
  _container: HTMLElement;
  _transition: d3.Transition<any>;
  _powerScale: d3.scale.Linear<number, number>;
  _timeScale: d3.time.Scale<number, number>;
  _xAxisGenerator: d3.svg.Axis;
  _yAxisGenerator: d3.svg.Axis;

  // Energy demand elements.
  _demandPathGenerator: d3.svg.Area<PowerSample>;
  _demandRegion: d3.Selection<PowerSample>;
  _demandBorderPathGenerator: d3.svg.Line<PowerSample>;
  _demandBorder: d3.Selection<PowerSample>;

  // Energy supply elements.
  _supplyPathGenerator: d3.svg.Area<StackAreaSpan>;
  _supplyRegionLayout: d3.layout.Stack<StackAreaSpan[], StackAreaSpan>;
  _supplyLayer: d3.Selection<StackAreaSpan>;

  // Consumed energy elements (subset of supplied energy).
  _consumedPathGenerator: d3.svg.Line<LinePoint>;
  _consumedLayer: d3.Selection<LinePoint>;
  _consumedBorder: d3.Selection<LinePoint>;

  // Excess energy generation elements (subset of supplied energy).
  _excessPathGenerator: d3.svg.Area<AreaSpan>;
  _excessLayer: d3.Selection<AreaSpan>;
  _excessRegion: d3.Selection<AreaSpan>;
  _excessBorderPathGenerator: d3.svg.Line<AreaSpan>;
  _excessBorder: d3.Selection<AreaSpan>;
  _excessMarkerLayer: d3.Selection<AreaSpan>;

  /**
   * Constructor.
   *
   * @param container The container element for the chart.
   * @param view The initial data view that the chart should render.
   * @param configOverrides Any chart configuration overrides (e.g., size).
   */
  constructor(
      container: HTMLElement,
      view: UtilityDataView,
      configOverrides: ChartOptions) {

    this._container = container;
    this._config = {};

    this._build(view, configOverrides);
  }

  /**
   * Updates the chart to render the given latest data view.
   *
   * @param view The data view to render.
   */
  update(view: UtilityDataView) {
    // Update energy generation supply profiles.
    const unstackedLayoutData = getUnstackedSupplyLayout(
        view, this._config.stackingOrder);
    const stackedLayoutData = this._supplyRegionLayout(unstackedLayoutData)

    const supplyRegions = this._supplyLayer
        .selectAll('path')
        .data(stackedLayoutData)
    supplyRegions.enter()
        .append('path')
        .classed('supply-area', true);
    const fills = this._config.stackingOrder
        .map(s => `url(#${this._config.patterns[s]})`);
    supplyRegions
        .attr('fill', (d, i) => fills[i])
        .attr('d', this._supplyPathGenerator);

    // Update excess energy generation profile.
    const excessSeries = getExcessLayout(view);
    this._excessRegion
        .datum(excessSeries)
        .attr('fill', `url(#${this._config.patterns.excess})`)
        .attr('d', this._excessPathGenerator);
    this._excessBorder
        .datum(excessSeries)
        .attr('d', this._excessBorderPathGenerator);

    // Update consumed energy profile.
    const consumedSeries = getConsumedLayout(view);
    this._consumedBorder
        .datum(consumedSeries)
        .attr('d', this._consumedPathGenerator);

    // Update points-of-interest markers.
    const markerPoints = this._getInterestMarkersLayout(view);
    // Text label for each marker.
    const labels = this._excessMarkerLayer
        .selectAll('.interest-marker-label')
        .data(markerPoints);
    labels.enter().append('text')
        .classed('interest-marker-label', true)
        .text(d => d.label)
        .style('text-anchor', 'middle');
    labels.exit().remove();
    labels
        .attr('x', d => d.x)
        .attr('y', d => d.labelYOffset + d.labelYGap);
    // Arrow from text label to data point of interest.
    const arrows = this._excessMarkerLayer
        .selectAll('.interest-marker-arrow')
        .data(markerPoints, d => String(d.x));
    arrows.enter().append('line')
        .classed('interest-marker-arrow', true);
    arrows.exit().remove();
    arrows
        .attr('x1', d => d.x)
        .attr('y1', d => d.y)
        .attr('x2', d => d.x)
        .attr('y2', d => d.labelYOffset)
        .style('stroke', d => d.color);

    // Update energy demand profile.
    const demandSeries = _getDemandSeries(view);
    this._demandRegion
        .datum(demandSeries)
        .attr('d', this._demandPathGenerator);
    this._demandBorder
        .datum(demandSeries)
        .attr('d', this._demandBorderPathGenerator);
  }

  /**
   * Configures and builds chart elements.
   *
   * @param view The initial data view for the chart to render.
   * @param configOverrides Any configuration overrides to apply.
   */
  _build(view: UtilityDataView, configOverrides: ChartOptions) {
    // Configure chart properties.
    util.mergeDeep(DEFAULT_CONFIG, this._config);
    util.mergeDeep(configOverrides, this._config);
    this._configureLayout(view);
    this._configureGenerators();

    // Get the region of the chart that will correspond to the data axes.
    const axesLayer = this._createChart();
    // Draw each of the data elements (energy profiles, etc.).
    this._createDataLayers(axesLayer);

    // Render the initial data view.
    this.update(view);
  }

  /**
   * Configures the visual layout of the chart.
   *
   * @param view The data view used for deriving scale extents.
   */
  _configureLayout(view: UtilityDataView) {
    this._transition = d3.transition()
        .delay(this._config.transition.delay)
        .duration(this._config.transition.duration);

    // Configure output ranges for axes scales based upon configured chart size.
    this._timeScale = d3.time.scale()
        .rangeRound([0, this._config.size.width]);
    this._powerScale = d3.scale.linear()
        .range([this._config.size.height, 0]);

    // Configure the domains for the scales according to the energy demand.
    const demandSeries = _getDemandSeries(view);
    // Get the min/max time points.
    this._timeScale.domain(
        d3.extent(demandSeries.map(d => d.timestamp)));
    // Scale from 0% to 100% of peak demand
    this._powerScale.domain(
        [0, d3.max(demandSeries.map(d => d.power))]);

    // Axis configuration.
    const xTicks = _getTimeScaleTicks(demandSeries.map(d => d.timestamp));
    this._xAxisGenerator = d3.svg.axis()
        .scale(this._timeScale)
        .orient('bottom')
        .tickFormat(d3.time.format('%A'))
        .tickValues(xTicks);
    const yTicks = _getPowerScaleTicks(view.profiles.series.demand);
    this._yAxisGenerator = d3.svg.axis()
        .scale(this._powerScale)
        .orient('left')
        .tickValues(yTicks);
  }

  /**
   * Configures the path and area generators for various data series.
   */
  _configureGenerators() {
    this._demandPathGenerator = d3.svg.area<PowerSample>()
        .x((d, i) => this._timeScale(d.timestamp))
        .y0(d => this._powerScale(0))
        .y1(d => this._powerScale(d.power));
    this._demandBorderPathGenerator = d3.svg.line<PowerSample>()
        .x(d => this._timeScale(d.timestamp))
        .y(d => this._powerScale(d.power))
        .interpolate('basis');

    const x: d3.layout.stack.Value = {x: 3, y:4};
    this._supplyPathGenerator = d3.svg.area<StackAreaSpan>()
      .x(d => this._timeScale(d.x))
      .y0(d => this._powerScale(d.y0))
      .y1(d => this._powerScale(d.y0 + d.y));

    // By default, stack layout wants an array of series
    // Each series should be an array of points
    //
    // layer1 = [{x: ..., y: ...}, ...]
    // stackData = [layer1, layer2, ...]
    this._supplyRegionLayout = d3.layout.stack<StackAreaSpan>();

    this._excessPathGenerator = d3.svg.area<AreaSpan>()
      .x((d, i) => this._timeScale(d.x))
      .y0(d => this._powerScale(d.y0))
      .y1(d => this._powerScale(d.y1))
      .defined(d => d.defined);

    this._excessBorderPathGenerator = d3.svg.line<AreaSpan>()
      .x(d => this._timeScale(d.x))
      .y(d => this._powerScale(d.y1))
      .defined(d => d.defined);

    this._consumedPathGenerator = d3.svg.line<LinePoint>()
        .x(d => this._timeScale(d.x))
        .y(d => this._powerScale(d.y))
        .defined(d => d.defined);
  }

  /**
   * Creates the static SVG elements for the chart.
   */
  _createChart() {
    // Container div element
    const container = d3.select(this._container)
      .classed('supply-demand-chart-container', true);

    // The SVG canvas needs to have room for the data area and the axis margins.
    const width = this._config.size.width
        + this._config.padding.left
        + this._config.padding.right;
    const height = this._config.size.height
        + this._config.padding.top
        + this._config.padding.bottom;
    const svg = container.append('svg')
        .classed('supply-demand-chart', true)
        .style('margin-left', `-${this._config.padding.left - 5}px`)
        .attr('width', width)
        .attr('height', height);

    const defs = svg.append('defs');
    // Create a static fill for the demand region.
    _createSolidPattern(
        defs,
        this._config.patterns.demand,
        this._config.colors.demand);
    // Create a static fill for the excess generation region.
    _createSpeckledPattern(
        defs,
        this._config.patterns.excess,
        this._config.colors.patternBackground,
        this._config.colors.excess);
    // Create the pattern fills for each energy source.
    this._config.stackingOrder.forEach(source => {
      _createSolidPattern(defs, `${source}-consumed`, this._config.colors[source]);
    });

    // Create a group that we'll use for applying margins and padding.
    const axesLayer = svg
      .selectAll('.supply-demand-chart-bar-group')
      .data([0]);
    axesLayer.enter().append('g');
    axesLayer
      .classed('supply-demand-chart-bar-group', true)
      // Whitespace margin.
      .attr('transform', `translate(${this._config.padding.left},${this._config.padding.top})`);

    return axesLayer;
  }

  /**
   * Creates the dynamic SVG elements for the chart.
   *
   * @param parent The parent d3 selection in which the elements should exist.
   */
  _createDataLayers(parent: d3.Selection<any>) {
    // Energy demand profile.
    this._demandRegion = parent.append('path')
        .attr('class', 'area')
        .attr('fill', `url(#${this._config.patterns.demand})`);
    this._demandBorder = parent.append('path')
        .classed('demand-curve-line', true);

    // Generated energy profiles.
    this._supplyLayer = parent.append('g')
        .classed('supply-regions', true);

    // Excess energy profile.
    this._excessLayer = parent.append('g')
        .classed('excess-group', true);
    this._excessRegion = this._excessLayer.append('path')
      .attr('class', 'area');
    this._excessBorder = this._excessLayer.append('path')
      .classed('excess-curve-line', true);

    // Border of the consumed energy region.
    this._consumedLayer = parent.append('g')
        .classed('consumed-curve', true);
    this._consumedBorder = this._consumedLayer.append('path')
      .classed('consumed-curve-line', true);

    // X and Y axes.
    const xAxisLayer = parent.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${this._config.size.height})`)
      .call(this._xAxisGenerator);
    const yAxisLayer = parent.append('g')
        .attr('class', 'y axis')
        .call(this._yAxisGenerator);
    const yAxisTitle = yAxisLayer
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(this._config.labels.yAxis);
    const rightWall = parent.append('line')
      .attr('class', 'bounding-box right-wall')
      .attr('x1', this._config.size.width)
      .attr('x2', this._config.size.width)
      .attr('y1', 0)
      .attr('y2', this._config.size.height);

    // Interest point markers.
    this._excessMarkerLayer = parent.append('g')
        .attr('class', 'excess-marker-group');
  }

  /**
   * Draws markers for points of interest within the chart.
   *
   * Points of interest might include features such as time ranges having excess energy
   * generation or unmet demand.
   *
   * @param containerGroup A selection for the element that will contain all marker content.
   * @param markerPoints The interest marker locations to draw.
   */

  _getInterestMarkersLayout(view: UtilityDataView): MarkerLayout[] {
    const markerLayout = getExcessMarkerLayout(
        view.profiles,
        this._config.behavior.showExcessLabelThreshold,
        this._config.layout.markers.labelMaxYValue);

    const markerPoints = markerLayout.map(p => {
      const point: MarkerLayout = {
        x: this._timeScale(p.timestamp),
        y: this._powerScale(p.placementValue),
        labelYOffset: 0,
        labelYGap: this._config.layout.markers.labelYGap,
        color: this._config.colors.markers,
        label: this._config.labels.excessMarker,
      };

      // Vertically offset the marker label so that it does not obsucre the
      // (x,y) point that is being described.
      point.labelYOffset = point.y + this._config.layout.markers.labelYOffset;

      return point;
    });

    return markerPoints;
  }
}


/**
 * Gets a series of time axis ticks for a given time range.
 *
 * Current approach places exactly one tick per day, at UTC noon, and expects
 * one or more time points that correspond to UTC noon.
 *
 * @param times A series of time points.
 * @returns A series of times corresponding to axis tick placements.
 * @throws An error if no tick placements are found.
 */
export function _getTimeScaleTicks(times: Date[]): Date[] {
  // Add a tick for noon (UTC) on each day in the input time series.
  const ticks = [];
  times.forEach(t => {
    if (t.getUTCHours() == 12) {
      ticks.push(t);
    }
  });
  if (!ticks.length) {
    throw new Error(
        'Expected time series to contain at least one UTC noon time point');
  }
  return ticks;
}

/**
 * Gets a series of power axis ticks for a given power range.
 *
 * @param demand The energy demand-over-time profile.
 */
export function _getPowerScaleTicks(demand: number[]): number[] {
  const [minDemand, maxDemand] = d3.extent(demand);
  function truncateThousands(value: number) {
    return Math.floor(value / 1000) * 1000;
  }
  return [
    0,
    truncateThousands(minDemand),  // Baseline power level.
    truncateThousands(maxDemand),  // Peak power level.
  ]
}

/**
 * Defines a speckled pattern (small dots) with given color scheme.
 *
 * @param defs An SVG <defs> element selection.
 * @param patternId The id of the pattern to create for referencing later.
 * @param backgroundColor The solid background color of the pattern.
 * @param foregroundColor The color of the foreground speckles of the pattern.
 */
export function _createSpeckledPattern(
    defs: d3.Selection<any>,
    patternId: string,
    backgroundColor: string,
    foregroundColor: string) {

  // Configure pattern scale in chart pixel units.
  const pattern = defs.append('pattern')
    .attr('id', patternId)
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 5)
    .attr('height', 5);
  // Solid background fill.
  pattern.append('rect')
    .attr('width', 5)
    .attr('height', 5)
    .attr('fill', backgroundColor);
  // Single dot that gets tiled.
  pattern.append('rect')
    .attr('width', 1)
    .attr('height', 1)
    .attr('fill', foregroundColor);
  return pattern;
}

/**
 * Defines a solid pattern with given color scheme.
 *
 * @param defs An SVG <defs> element selection.
 * @param patternId The id of the pattern to create for referencing later.
 * @param color The color of the fill.
 */
export function _createSolidPattern(
    defs: d3.Selection<any>,
    patternId: string,
    color: string) {

  // Configure pattern scale in chart pixel units.
  const pattern = defs.append('pattern')
    .attr('id', patternId)
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 30)
    .attr('height', 30);
  // Solid background fill.
  pattern.append('rect')
    .attr('width', 30)
    .attr('height', 30)
    .attr('fill', color);

  return pattern;
}

/**
 * Generates a demand series indexed by timestamp.
 *
 * @param view The data view for the energy supply and demand.
 * @returns A series of points representing the demand over time.
 */
export function _getDemandSeries(view: UtilityDataView): PowerSample[] {
  return view.profiles.index.map((t, i) => {
    return {
      timestamp: new Date(t),
      power: view.profiles.series.demand[i],
    };
  });
}


/**
 * Gets a data layout for the energy supply series.
 *
 * The data format returned is that expected by the d3.layout.stack() API.
 *
 * @param view The data view with energy supply profiles per source.
 * @param order The series stacking order from bottom to top.
 * @returns The restructured, ordered energy series data ready for stacking.
 */
export function getUnstackedSupplyLayout(
    view: UtilityDataView,
    order: string[]): StackAreaSpan[][] {

  // Generate the x-y point representation for each energy source area series.
  const stackedData: {[s: string]: StackAreaSpan[]} = {}
  order.forEach(source => {
    stackedData[source] = [];
  });
  view.profiles.index.map((timestamp, i) => {
    order.forEach(source => {
      stackedData[source].push({
        x: new Date(timestamp),
        // Note that the y-value here is really the height or thickness of the
        // area region at the current index; equivalent to the y-value if the
        // baseline for the current series was zero.
        y: view.profiles.series[source][i],
      });
    });
  });

  // Convert the {source: series} map into a stack-ordered array of series.
  return order.map(s => stackedData[s]);
}

/**
 * Gets a data layout for the consumed energy region.
 *
 * To avoid visual artifacts, the energy consumption border is not drawn in the
 * following cases:
 * 1. Where supply == demand (don't draw on top of the demand line)
 * 2. Where supply == 0 (don't draw on top of the axis line)
 * 3. Where supply > demand (don't draw on top of the excess line)
 *
 * @param view The data view with energy supply and demand profiles.
 * @returns A piecewise series of consumed energy regions.
 */
export function getConsumedLayout(view: UtilityDataView): LinePoint[] {
  const series = view.profiles.series;
  const points = view.profiles.index.map((t, i) => {
    return {
      x: new Date(t),
      y: Math.min(series.supply[i], series.demand[i]),
      defined: (series.supply[i] > 0) && (series.supply[i] <= series.supply[i]),
    };
  });

  defineIntervalEndpoints(points);
  return points;
}

/**
 * Gets a data layout for the excess energy region.
 *
 * To avoid visual artifacts, the excess region is not drawn in the following
 * cases:
 * 1. Where excess == 0 (don't draw on top of the demand line)
 * 2. Where demand > supply (no excess energy exists)
 *
 * @param view The data view with energy supply and demand profiles.
 * @returns A piecewise series of excess energy regions.
 */
export function getExcessLayout(view: UtilityDataView): AreaSpan[] {
  const series = view.profiles.series;
  const points = view.profiles.index.map((t, i) => {
    return {
      x: new Date(t),
      y0: series.demand[i],
      y1: series.supply[i],
      defined: series.supply[i] > series.demand[i],
    };
  });

  defineIntervalEndpoints(points);
  return points;
}

/**
 * Gets a data layout for the excess energy generation indicator markers.
 *
 * @param view
 * @param showThreshold
 * @param maxPlacement
 * @returns A series of excess marker locations and label placements.
 */
export function getExcessMarkerLayout(
    profiles: ProfileDataset, showThreshold: number, maxPlacement: number):
    MarkerPlacement[] {

  const markers = [];

  // Find the point of maximum excess energy generation.
  const maxExcess: MarkerPlacement = {
    excessValue: 0,
    placementValue: null,
    timestamp: null,
  };
  profiles.index.forEach((t, i) => {
    const generated = profiles.series.supply[i];
    const demand = profiles.series.demand[i];
    const excess = Math.max(generated - demand, 0);

    // Prevent label from going above the chart area by enforcing a "ceiling".
    if (excess > maxExcess.excessValue) {
      maxExcess.excessValue = excess;
      maxExcess.placementValue = Math.min(generated, maxPlacement);
      maxExcess.timestamp = new Date(t);
    }
  });

  // Don't show excess markers for tiny slivers of excess, only big chunks.
  if (maxExcess.excessValue > showThreshold) {
    markers.push(maxExcess);
  }

  return markers;
}

/**
 * Adds defined endpoints to each contiguous subsequence of defined points.
 *
 * Transitions between defined/undefined intervals need to be smoothed in order
 * to avoid visual discontinuties where areas or lines transition from existing
 * to not existing.
 *
 * No points are added or removed from the data layout series; instead, points
 * neighboring a defined point are also marked as defined, which provides a
 * smooth transition from defined to undefined intervals.
 *
 * @param series A data layout series of points, each of which could be
 *   undefined.
 */
export function defineIntervalEndpoints<T extends LayoutPoint>(series: T[]) {
  const length = series.length;

  // Make a pass over the series and identify which points should be defined
  // in order close all endpoints within the series.
  const closedEndpoints = series.map((point, i) => {
    let isDefined = point.defined;
    if (!isDefined) {
      if (i > 0) {
        isDefined = isDefined || series[i - 1].defined;
      }
      if (i < length - 1) {
        isDefined = isDefined || series[i + 1].defined;
      }
    }
    return isDefined;
  });

  // Overwrite the open endpoint intervals with the closed endpoint intervals.
  closedEndpoints.forEach((isDefined, i) => series[i].defined = isDefined);
}


/**
 * A single point from a piecewise data layout.
 *
 * Useful for capturing piecewise line and area point series layouts where the
 * data may contain one or more intervals.
 */
interface LayoutPoint {
  // Should visual components be drawn for the associated location.
  defined: boolean;
}

/**
 * A single point for an energy profile series.
 */
interface PowerSample {
  timestamp: Date,  // Time index.
  power: number,  // Power level.
}

/**
 * A single point from a line layout.
 */
interface LinePoint extends LayoutPoint {
  x: Date, // Time index.
  y: number, // Total consumed power.
  defined: boolean, // Is the consumed series non-zero at this sample?
}

/**
 * A single span from an area layout (e.g., excess energy region).
 */
interface AreaSpan extends LayoutPoint {
  x: Date,  // Location of span.
  y0: number,  // Location of bottom of area span.
  y1: number,  // Location of top of area span.
}

/**
 * A single span from a stacked area layout (e.g., energy supply regions).
 */
interface StackAreaSpan {
  x: Date,  // Location of span.
  y: number,  // Height or thickness of span from baseline.
  y0?: number,  // Location of bottom of area span.
}

/**
 * A single marker point in chart (x, y) dimensions.
 */
interface MarkerLayout {
  x: number,  // The chart x-coordinate of the location being described.
  y: number,  // The chart y-coordinate of the location being described.
  labelYOffset: number,  // The vertical offset distance for the label.
  labelYGap: number,  // The whitespace distance between the label and arrow.
  label: string,  // The text for the label.
  color: string,  // The color of the label and arrow.
}

/**
 * A single marker point in data (time, power) dimensions.
 */
interface MarkerPlacement {
  excessValue: number,  // Amount of excess power.
  placementValue: number,  // Absolute power value at which to place marker.
  timestamp: Date,  // Time point at which to place marker.
}