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


// Type definition specific to utility mode.
type UtilityEnergySource = 'solar' | 'wind' | 'nuclear' | 'ng' | 'coal';
type ProfileSeries = 'demand' | 'unmet' | UtilityEnergySource;

// Object literal types keyed by a fixed set of values.
type UtilityEnergySourceMap<T> = {[K in UtilityEnergySource]: T};
type ProfileSeriesMap<T> = {[K in ProfileSeries]: T};

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
  series: ProfileSeriesMap<number[]>;
}

/**
 * Per-energy source allocation fractions.
 *
 * Values are in [0, 1] inclusive, with 0 indicating 0% allocation and
 * 1 indicating 100% allocation for the given energy source (e.g., 'nuclear').
 */
type ProfileAllocations = UtilityEnergySourceMap<number>;

/**
 * Utility mode data and configuration view.
 */
interface UtilityDataView extends SummaryDataView {
  // The allocated time profile for each available energy source.
  profiles: ProfileDataset;

  // The per-energy source allocations.
  //
  // The utility view configuration state is determined by the allocations.
  allocations: ProfileAllocations;
}

/**
 * Components that render views of the utility data.
 */
interface UtilityDataComponent {
  /**
   * Updates the component to render data within the new data view.
   *
   * @param view The new data view to render.
   */
  update(view: UtilityDataView);
}