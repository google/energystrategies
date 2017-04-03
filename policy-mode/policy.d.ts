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


// Policy-related type definitions.
type PolicyEnergySource = 'hydro' | 'coalccs' | 'ngccs' | EnergySource;
type PolicyBreakdownEntry = 'storage' | PolicyEnergySource;

type PolicyDimension =
    'solar_price' |
    'wind_price' |
    'nuclear_price' |
    'ng_price' |
    'carbon_tax' |
    'rps' |
    'rps_includes_carbon_capture' |
    'rps_includes_nuclear_energy' |
    'nuclear_allowed' |
    'storage_allowed';

type PolicyFact =
    'co2' |
    'cost' |
    'storage_cost' |
    'solar_energy' |
    'solar_cost' |
    'wind_energy' |
    'wind_cost' |
    'nuclear_energy' |
    'nuclear_cost' |
    'ng_energy' |
    'ng_cost' |
    'ngccs_energy' |
    'ngccs_cost' |
    'coal_energy' |
    'coal_cost' |
    'coalccs_energy' |
    'coalccs_cost' |
    'hydro_energy' |
    'hydro_cost';

type PolicyOutcomeBreakdown = ScenarioOutcomeBreakdown<PolicyBreakdownEntry>;

/**
 * A policy decision mapping each dimension to a chosen level.
 */
type PolicyConfig = {[K in PolicyDimension]: number};

interface PolicyDataView extends SummaryDataView<PolicyBreakdownEntry> {
  // The policy view configuration state is determined by the set of
  // user-selectable "dimensions".
  choices: PolicyConfig;
}

interface PolicyDataComponent {
  update(view: PolicyDataView);
}

/**
 * An indexed dataset of scenarios that supports slice selections.
 */
interface DatasetIndex {
  select(key: PolicyConfig): ScenarioOutcomeBreakdown<PolicyBreakdownEntry>;
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
interface PolicyDatasetSchema {
  // A dimension is a scenario configuration option that is variable.
  dimensions: PolicyDimension[];

  // A fact is any piece of data that is associated with a scenario outcome.
  facts: PolicyFact[];

  // A scale maps an ordinal dimension level to the associated units.
  //
  // For example, a 3-level cost scale for solar power would be represented as
  // `solar = [cost_point_0_USD, cost_point_1_USD, cost_point_2_USD]`
  // such that `solar[1]` maps the ordinal dimension level `1` to the
  // corresponding cost point in USD.
  scales: {[K in PolicyDimension]: number[]},

  // The shape of the n-dimensional array for the dataset.
  //
  // The shape of the ndarray is given by the size of each dimension:
  // `[scales[0].length, scales[1].length, ..., scales[dimensions.length-1]]`
  shape: number[];

  baseline: PolicyDataRow<number>,
  population: number,
}

/**
 * A sweep dataset including scenario outcomes.
 */
interface PolicyDataset {
  // Schema for policy option sweep dataset.
  schema: PolicyDatasetSchema;

  // Scenario outcomes for each possible policy configuration.
  //
  // Order of scenarios is according to dimensions schema and
  // per-dimension shape as specified by the dataset summary.
  //
  // Note that each row of the policy table is the CSV-based
  // representation returned by d3.csv, which is why all values
  // in the {'field': 'string_value'} row objects have string
  // values (rather than the intended type, e.g., number).
  scenarios: PolicyDataTable;
}

/**
 * Tabular data format for policy dataset with one row per scenario.
 */
type PolicyDataRow<T> = {[K in PolicyFact]: T};
type PolicyDataRowCSV = PolicyDataRow<string>;
type PolicyDataTable = PolicyDataRowCSV[];

