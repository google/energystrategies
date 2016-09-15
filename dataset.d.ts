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


/**
 * Scenario outcome data.
 */
interface ScenarioOutcome {
  cost: number;
  co2: number;
}

/**
 * Scenario outcomes that also include a specified display title.
 */
interface TitledScenarioOutcome extends ScenarioOutcome {
  title: string;
}

/**
 * Scenario outcome that also includes cost/co2 attributions by energy source.
 */
interface ScenarioOutcomeBreakdown extends ScenarioOutcome {
  breakdown: {
    ng: EnergySourceOutcome;
    solar: EnergySourceOutcome;
    wind: EnergySourceOutcome;
    nuclear: EnergySourceOutcome;
  };
}

/**
 * Aggregated scenario outcome details specific to a single energy source.
 */
interface EnergySourceOutcome {
  fixed_cost: number;
  variable_cost: number;
  co2: number;
}

/**
 * Page components that are updated when the playground state changes.
 */
interface PlaygroundView {
  update(view: PlaygroundState);
}

/**
 * Page components that are updated when the dataset selection changes.
 */
interface DatasetSelectionView {
    update(view: DatasetSelection);
}

/**
 * A selected scenario outcome and all dimension-aligned variants.
 */
interface DatasetSelection {
    scenario: ScenarioOutcome;
    slices: {[dimension: string]: DimensionSlice};
}
/**
 * A dimension-aligned slice of scenarios sorted by dimension level (ordinal).
 */
interface DimensionSlice {
  // Scenario configuration dimension that varies among the scenarios.
  dimension: string;

  // Scenarios that vary along the given dimension from level[0] to level[D].
  scenarios: ScenarioOutcome[];
}

interface PlaygroundState extends DatasetSelection {
  // adds fields around comparison to a reference point
  reference: ScenarioOutcome;
  // scenario: Scenario; // FIXME: duplicate field in dataset selection view
  deltaToRef: {
    co2: number,
    cost: number,
  };
}

/**
 * An indexed dataset of scenarios that supports slice selections.
 */
interface DatasetIndex {
  // Select all sweeps relative to the given scenario specification.
  select(scenarioSpec: ScenarioSpec): DatasetSelection;
}

/**
 * A scenario is specified by a map of `{Dimension: level}`.
 */
interface ScenarioSpec {
  rps: number;
  solar: number;
  ccs_in_rps: number;
}

/**
 * A collection of scenarios with a common base configuration.
 *
 * The `dimensions` of the dataset specify the configuration values that can
 * vary.
 *
 * A dataset contains a scenario outcome for every unique
 * dimension value combination; i.e., for a dataset with `D` dimensions, and
 * each dimension having `di` ordinal levels, there will be all
 * `(d0 * d1 * d2 * ... * dD)` scenario outcomes available.
 */
interface Dataset {
  // A dimension is a scenario configuration option that is variable.
  dimensions: string[];  // FIXME: Dimension enum instead

  // A fact is any piece of data that is associated with a scenario outcome.
  facts: string[];

  // A scale maps an ordinal dimension level to the associated units.
  //
  // For example, a 3-level cost scale for solar power would be represented as
  // `solar = [cost_point_0_USD, cost_point_1_USD, cost_point_2_USD]`
  // such that `solar[1]` maps the ordinal dimension level `1` to the
  // corresponding cost point in USD.
  scales: {
    rps: number[];
    solar: number[];
    ccs_in_rps: number[];
  };

  // The shape of the n-dimensional array for the dataset.
  //
  // The shape of the ndarray is given by the size of each dimension:
  // `[scales[0].length, scales[1].length, ..., scales[dimensions.length-1]]`
  shape: number[];

  // The row-major ordered array of scenarios for all dimension configurations.
  scenarios: ScenarioOutcome[];
}

/**
 * A collection of energy supply and demand profiles with a common time domain.
 */
interface ProfileDataset {
  // Time domain index that maps 1:1 with each profile series.
  //
  // Each value should be an integer timestamp that is milliseconds since
  // 1 January, 1970 UTC (i.e., UNIX epoch, but in milliseconds).
  index: number[];

  // Common energy profile units for each series.
  //
  // Used for validating conversion of data during dimensional analysis; i.e.,
  // a string consumed by humans while auditing rather than for display;
  // e.g., 'MW'.
  units: string;

  // A set of energy profiles that map 1:1 with one another and the time index.
  //
  // i.e., for all i, series.foo[i] <=> series.bar[i] <=> index[i].
  series: {
    demand: number[];
    unmet?: number[];

    solar: number[];
    wind: number[];
    nuclear: number[];
    ng: number[];
  };
}

/**
 * Per-energy source allocation fractions.
 *
 * Values are in [0, 1] inclusive, with 0 indicating 0% allocation and
 * 1 indicating 100% allocation for the given energy source (e.g., 'nuclear').
 */
interface ProfileAllocations {
  ng: number;
  solar: number;
  wind: number;
  nuclear: number;
}
