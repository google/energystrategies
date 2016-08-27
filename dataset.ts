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

/// <reference path="typings/index.d.ts" />
/// <reference path="ndarray.d.ts" />
/// <reference path="dataset.d.ts" />

declare const require: any;
const ndarray = require('ndarray');

/**
 * A multi-dimensional index over scenarios with efficient slice operations.
 */
export class NDArrayIndex implements DatasetIndex {

  dataset: Dataset;
  flat: number[];
  hypercube: NDArray;

  constructor(dataset: Dataset) {
    this.dataset = dataset;
    this.flat = null;
    this.hypercube = null;

    this._build();
  }

  select(spec: ScenarioSpec) {
    // Validate that all required dimensions are present in the key.
    this.dataset.dimensions.forEach(d => {
      if (spec[d] === null || spec[d] === undefined) {
        throw new Error(
            `Invalid scenario key is missing dimension ${d}; \
            required dimensions are ${this.dataset.dimensions}`);
      }
    });

    const view: DatasetSelection = {scenario: null, slices: {}};
    // Lookup the scenario matching the scenario key.
    view.scenario = this._getScenario(spec);

    // Iterate over each dimension and extract dimension-aligned slices.
    this.dataset.dimensions.forEach(d => {
      // Overwrite the dimension being swept with null value to indicate sweep.
      const scenarioLevel = spec[d];
      spec[d] = null;

      view.slices[d] = this._getSlice(spec);

      // Rewrite the dimension level for the current scenario.
      spec[d] = scenarioLevel;
    });

    return view;
  }

  /**
   * Convert a dimension key to an array of dimension levels.
   */
  _asDimensionLevels(spec: ScenarioSpec) {
    return this.dataset.dimensions.map(d => spec[d]);
  }

  /**
   * Indexes a dataset into a hypercube with each scenario dimension as an axis.
   */
  _build() {
    // Build a simple Array of indices:
    // [0, 1, 2, ..., *<dataset.scenarios.length> - 1)]
    const flatIndex = [];
    for (let i = 0; i < this.dataset.scenarios.length; ++i) {
      flatIndex.push(i);
    }
    this.flat = flatIndex;
    this.hypercube = ndarray(this.flat, this.dataset.shape);

    return this;
  }

  /**
   * Selects a slice of scenarios that vary along a single scenario dimension.
   */
  _getSlice(spec: ScenarioSpec) {
    // Validate the dimension key and identify the swept dimension.
    let sliceDimension: string = null;
    Object.keys(spec).forEach(dimension => {
      if (spec[dimension] == null) {
        sliceDimension = dimension;
      }
    });
    if (sliceDimension === null) {
      throw new Error(
        `Slice selection key must specify exactly 1 dimension as null; \
        no slice dimensions found`);
    }

    const view = this.hypercube.pick.apply(
        this.hypercube, this._asDimensionLevels(spec));

    if (view.shape.length > 1) {
      throw new Error(
        `Slice selection key must exactly 1 dimension as null; attempted to \
        slice ${view.shape.length} dimensions`);
    }

    const slicedScenarios = [];
    for (let i = 0; i < view.shape[0]; ++i) {
      const flatIndex = view.get(i);
      slicedScenarios.push(this.dataset.scenarios[flatIndex]);
    }

    return {
      dimension: sliceDimension,
      scenarios: slicedScenarios,
    };
  }

  /**
   * ALL dimensions must be defined within the key or this is an error.
   */
  _getScenario(spec: ScenarioSpec) {
    const flatIndex = this.hypercube.get.apply(
        this.hypercube, this._asDimensionLevels(spec));
    return this.dataset.scenarios[flatIndex];
  }
}
