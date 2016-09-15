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
/// <reference path="dataset.d.ts" />

import * as config from './config';
import * as util from './util';


/**
 * Summarize the given profile set into aggregated cost and co2 values.
 *
 * Note: assumes provided profiles are for exactly 1 week in 168 hour-sized
 * slices when accounting for the co2 emissions discount rate as part of
 * variable costs.
 *
 * @param profiles An energy profile collection for which to aggregate stats.
 * @return A summary of cost and co2 outcomes by energy generation source.
 */
export function summarize(profiles: ProfileDataset): ScenarioOutcomeBreakdown {
  // Compute the cost and co2 contributions for each energy source.
  let breakdown = {ng: null, solar: null, wind: null, nuclear: null};
  config.ALL_ENERGY_SOURCES.forEach(source => {
    // Find the total energy supplied by the profile (MWh).
    let profileEnergy = util.sum(profiles.series[source]);

    // Find the minimum capacity required to support the profile (MW).
    let profileCapacity = util.max(profiles.series[source]);

    breakdown[source] = {
      co2: getCo2(profileEnergy, source),
      variable_cost: getVariableCost(profileEnergy, source),
      fixed_cost: getFixedCost(profileCapacity, source),
    };
  });

  // Compute rollups across all energy sources.
  const totalCo2 = util.sum(Object.keys(breakdown).map(s => breakdown[s].co2));
  const totalCost = util.sum(Object.keys(breakdown).map(s => {
    return breakdown[s].fixed_cost + breakdown[s].variable_cost;
  }));

  return {
    co2: totalCo2,
    cost: totalCost,
    breakdown: breakdown,
  };
}

/**
 * Gets the fixed (monetary) cost of given energy generation capacity.
 *
 * @param capacity Energy generation capacity in MW.
 * @param source The type of energy source (e.g., 'nuclear').
 * @return The fixed cost of building the specified energy generation capacity.
 */
function getFixedCost(capacity: number, source: string) {
  // Dimensional analysis: MW * $USD/MW => $USD
  return capacity * config.FIXED_COST[source];
}

/**
 * Gets the variable (monetary) cost to generate the given amount of energy.
 *
 * Variable costs are amortized over the 30-year lifetime of the given energy
 * generation capacity with an applied discount rate.
 *
 * @param energy The total amount of energy generated in MWh.
 * @param source The energy source that generated the energy (e.g., 'nuclear').
 * @return The variable cost of generating the given amount of energy.
 */
function getVariableCost(energy: number, source: string) {
  // Dimensional analysis: MWh * $USD/MWh => $USD
  return energy * config.VARIABLE_COST[source] * config.DISCOUNT_RATE_WEEKLY;
}

/**
 * Gets the total CO2 created while generating the given amount of energy.
 *
 * @param energy The total amount of energy generated in MWh.
 * @param source The energy source that generated the energy (e.g., 'nuclear').
 * @return The total CO2 created as a result of energy generation in
 *     metric tonnes.
 */
function getCo2(energy: number, source: string): number {
  // Dimensional analysis: MWh * lbs/MWh * tonnes/lbs => tonnes
  //
  // Note: the 1-week co2 is scaled to the 1-year level for consistency with
  // scenario outcome datasets.
  return energy * config.CO2_RATE[source] * config.WEEKS_PER_YEAR;
}

/**
 * Gets an energy profile set scaled by the given per-source allocations.
 *
 * For non-dispatchable energy sources (e.g., solar, wind, nuclear), the shape
 * of each profile is maintained and the integral is scaled according to the
 * assigned allocation.
 *
 * For dispatchable energy sources (e.g., natural gas), the shape of each
 * profile is taken as the upper bound of available dispatch capacity. In the
 * returned energy profile set, dispatchable source profiles reflect the amount
 * of energy that was required to meet demand (without overage) at each point
 * in time.
 *
 * @param allocations Per-energy source allocation fractions (in [0,1]).
 * @param profiles A set of energy generation profiles.
 * @return A scaled set of energy generation profiles covering the same
 *   time period.
 */
export function getAllocatedEnergyProfiles(
    allocations: ProfileAllocations,
    profiles: ProfileDataset): ProfileDataset {

  // Scale the energy profiles by their user-assigned capacity allocations.
  const allocatedProfiles = {
    solar: profiles.series.solar.map(x => x * allocations.solar),
    wind: profiles.series.wind.map(x => x * allocations.wind),
    nuclear: profiles.series.nuclear.map(x => x * allocations.nuclear),
    ng: profiles.series.ng.map(x => x * allocations.ng),
  };

  // Given the non-dispatchable energy supply profiles, which are fixed,
  // compute the available dispatchable energy supply profile and remaining
  // unmet demand profile.
  const unmetProfile = [];
  const dispatchProfile = [];
  for (let i = 0; i < profiles.series.demand.length; ++i) {
    // Find the total power supplied at time[i] for non-dispatchables.
    let supplied = 0;
    config.NON_DISPATCHABLE_ENERGY_SOURCES.forEach(name => {
      supplied += allocatedProfiles[name][i];
    });

    // Any remaining gap beteween demand[i] and sum(non_dispatchable[k][i])
    // needs to be fulfilled by a dispatchable power supply or it goes
    // unfulfilled.
    let needed = Math.max(profiles.series.demand[i] - supplied, 0);
    let dispatchAvailable = allocatedProfiles.ng[i];
    let dispatched = 0;
    let unmet = 0;
    if (dispatchAvailable >= needed) {
      // We have enough dispatch to cover current timepoint's demand.
      //
      // Dispatch only what's needed currently
      dispatched = needed;
      unmet = 0;
    } else {
      // Insufficient dispatch available... gap in power supply.
      //
      // Dispatch all available and record gap
      dispatched = dispatchAvailable;
      unmet = needed - dispatched;
    }

    dispatchProfile.push(dispatched);
    unmetProfile.push(unmet);
  }

  return {
    index: profiles.index,
    units: profiles.units,
    series: {
      // Demand curve targeted for fulfillment.
      demand: profiles.series.demand,

      // Profile of unmet demand.
      unmet: unmetProfile,

      // Non-dispatchable energy supplied.
      solar: allocatedProfiles.solar,
      wind: allocatedProfiles.wind,
      nuclear: allocatedProfiles.nuclear,

      // Dispatchable-energy supplied.
      ng: dispatchProfile,
    }
  };
}