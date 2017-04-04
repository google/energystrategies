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


declare const require: any;
const ndarray = require('ndarray');


/**
 * A multi-dimensional index over scenarios with efficient slice operations.
 */
export class NDArrayIndex implements DatasetIndex {

  _dataset: PolicyDataset;
  _flatIndex: number[];
  _hypercubeIndex: NDArray;

  /**
   * Constructor.
   *
   * @param dataset A policy sweep dataset with scenario outcomes.
   */
  constructor(dataset: PolicyDataset) {
    this._dataset = dataset;
    this._flatIndex = null;
    this._hypercubeIndex = null;

    // Validate and index the scenarios in the sweep dataset.
    this._buildIndex();
  }

  /**
   * Selects a scenario for the given set of policy choices.
   *
   * @param policy A configuration of policy options.
   * @returns A scenario outcome for the corresponding policy.
   */
  select(policy: PolicyConfig): PolicyOutcomeBreakdown {
    // Lookup the scenario matching the scenario key.
    return this._getScenario(policy);
  }

  /**
   * Convert a dimension key to an array of dimension levels.
   *
   * @param policy A configuration of policy choices.
   * @returns An array representation of the policy choices as a list of
   *   dimension levels: [<dimension 0 level>, <dimension 1 level>, ...]
   */
  _asDimensionIndex(policy: PolicyConfig) {
    return this._dataset.schema.dimensions.map(d => policy[d]);
  }

  /**
   * Indexes a dataset into a hypercube with each scenario dimension as an axis.
   */
  _buildIndex() {
    // Build a simple Array of indices:
    // [0, 1, 2, ..., *<dataset.scenarios.length> - 1)]
    const flatIndex = [];
    for (let i = 0; i < this._dataset.scenarios.length; ++i) {
      flatIndex.push(i);
    }
    this._flatIndex = flatIndex;
    this._hypercubeIndex = ndarray(
        this._flatIndex, this._dataset.schema.shape);

    return this;
  }

  /**
   * Looks up the scenario outcome for the given policy choices.
   *
   * @param policy A configuration of policy options.
   * @returns A scenario outcome for the corresponding policy.
   */
  _getScenario(policy: PolicyConfig): PolicyOutcomeBreakdown {
    this._dataset.schema.dimensions.forEach(dimension => {
      if (policy[dimension] == undefined || policy[dimension] == null) {
        throw new Error(
          `Policy lookup key missing dimension level for \
          ${dimension}: ${policy}`);
      }
    });

    const flatIndex = this._hypercubeIndex.get.apply(
        this._hypercubeIndex, this._asDimensionIndex(policy));
    return this._getScenarioOutcome(flatIndex);
  }

  /**
   * Looks up the scenario outcome in the flat index.
   *
   * @param flatIndex The index of the scenario if the flattened (row-major
   *   order) representation of the hypercube (schema.shape).
   * @returns A scenario outcome for the corresponding policy.
   */
  _getScenarioOutcome(flatIndex: number): PolicyOutcomeBreakdown {
    return parsePolicyRowCSV(
      this._dataset.scenarios[flatIndex],
      this._dataset.schema);
  }

  /**
   * Selects a slice of scenarios that vary along a single scenario dimension.
   *
   * @param policy A configuration of policy options. The one dimension that has
   *   a null value will be sliced, returning one scenario for each unique value
   *   in the sliced dimension.
   * @returns A struct {dimension: <sliced dimension>, scenarios: scenario[]}.
   */
  _getSlice(policy: PolicyConfig) {
    // Validate the dimension key and identify the swept dimension.
    let sliceDimension: string = null;
    Object.keys(policy).forEach(dimension => {
      if (policy[dimension] == null) {
        sliceDimension = dimension;
      }
    });
    if (sliceDimension === null) {
      throw new Error(
        `Slice selection key must specify exactly 1 dimension as null; \
        no slice dimensions found`);
    }

    const view = this._hypercubeIndex.pick.apply(
        this._hypercubeIndex, this._asDimensionIndex(policy));

    if (view.shape.length > 1) {
      throw new Error(
        `Slice selection key must exactly 1 dimension as null; attempted to \
        slice ${view.shape.length} dimensions`);
    }

    const slicedScenarios = [];
    for (let i = 0; i < view.shape[0]; ++i) {
      const flatIndex = view.get(i);
      slicedScenarios.push(this._getScenarioOutcome(flatIndex));
    }

    return {
      dimension: sliceDimension,
      scenarios: slicedScenarios,
    };
  }
}


/**
 * Parses a CSV row returned by d3.csv.
 *
 * @param row A {'column_name': 'row_value'} map representing one CSV row.
 * @param schema The schema of the dataset the row belongs to.
 * @returns A single scenario outcome extracted from the row data.
 */
export function parsePolicyRowCSV(
    row: PolicyDataRow<any>,
    schema: PolicyDatasetSchema): PolicyOutcomeBreakdown {

  const outcome: PolicyOutcomeBreakdown = {
    co2: null,
    cost: null,
    breakdown: {
      solar: {},
      wind: {},
      ng: {},
      ngccs: {},
      nuclear: {},
      hydro: {},
      coal: {},
      coalccs: {},
      storage: {},
    }
  };

  // Convert each "<energy source name>_<allocation property>"
  // e.g., "{solar_capacity: x}" => solar: {capacity: x}
  schema.facts.forEach(fact => {
    const tokens = fact.split('_');
    let field, source;
    if (tokens.length == 1) {
      field = tokens[0]; // e.g., co2 or cost
      outcome[field] = parseFloat(row[fact]);
    } else if (tokens.length == 2) {
      [source, field] = tokens; // e.g., solar_energy or wind_energy

      // Convert the csv string values to corresponding types,
      // which are all floats at the moment.
      outcome.breakdown[source][field] = parseFloat(row[fact]);
    } else {
      throw new Error(
          `Unexpected field structure has more than 2 tokens:
          ${fact} => ${tokens}`);
      }
  });

  return outcome;
}
