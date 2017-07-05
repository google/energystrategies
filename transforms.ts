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

/// <reference path="./typings/index.d.ts"/>

import * as formatters from './formatters';
import * as util from './util';


export const MONTHS_PER_YEAR = 12;
export const WEEKS_PER_YEAR = 52;
export const DISCOUNT_RATE_YEARLY = 14.6;  // Rate of 6% over 30 years.
export const DISCOUNT_RATE_WEEKLY = DISCOUNT_RATE_YEARLY * WEEKS_PER_YEAR;
const PEOPLE_PER_HOUSEHOLD = 2.53;
const MONTHLY_COST_PER_HOUSEHOLD_FACTOR = PEOPLE_PER_HOUSEHOLD
    / (MONTHS_PER_YEAR * DISCOUNT_RATE_YEARLY);

/**
 * Gets the cost to generate a MWh of energy in $USD.
 *
 * A MWh is roughly what a typical household consumes each month.
 *
 * @param cost The total cost of power generation for the region ($USD) over the
 *   lifetime of the infrastructure.
 * @param consumed The total number of MWh consumed for the region per year;
 *   i.e., any excess generation beyond demand is ignored due to curtailment.
 * @returns The cost per MWh of energy fulfillment in $USD.
 */
export function perMWhCost(cost: number, yearlyConsumed: number) {
  return cost / DISCOUNT_RATE_YEARLY / yearlyConsumed;
}

/**
 * Gets the monthly cost per household in the region.
 *
 * @param cost The total cost of power generation for the region ($USD) over the
 *   lifetime of the infrastructure.
 * @param population The population of the region.
 * @return The monthly cost per household in the region ($USD).
 */
export function asMonthlyPerHouseholdCost(cost: number, population: number) {
  return cost / population * MONTHLY_COST_PER_HOUSEHOLD_FACTOR;
};

/**
 * Gets the relative change of the current scenario versus the baseline outcome.
 *
 * @param baseline The reference outcome for relative comparison.
 * @param current The scenario outcome being compared to the baseline.
 * @returns The deviation of cost and CO2 emissions relative to the baseline.
 */
export function deltas(baseline: ScenarioOutcome, current: ScenarioOutcome) {
  function delta(ref, value) {
    return (value - ref) / ref;
  }

  return {
    co2: delta(baseline.co2, current.co2),
    cost: delta(baseline.cost, current.cost),
  };
};

/**
 * Extracts the total cost from a scenario summary view.
 *
 * @param view A scenario summary view.
 * @returns The total scenario cost ($USD/MWh).
 */
export function totalCost(view: SummaryDataView<string>) {
  return perMWhCost(view.summary.cost, view.summary.energy);
}

/**
 * Extracts the baseline cost from a scenario summary view.
 *
 * @param view A scenario summary view.
 * @returns The baseline scenario cost ($USD/MWh).
 */
export function baselineCost(view: SummaryDataView<string>) {
  return perMWhCost(view.baseline.cost, view.baseline.energy);
}

/**
 * Extracts the cost delta of the scenario relative to the baseline.
 *
 * @param view A scenario summary view.
 * @returns The cost difference between the scenario and the baseline
 *   ($USD/MWh).
 */
export function baselineDeltaCost(view: SummaryDataView<string>) {
  const baselineCost = perMWhCost(
view.baseline.cost, view.baseline.energy);
  const scenarioCost = perMWhCost(
      view.summary.cost, view.summary.energy)
  return scenarioCost - baselineCost;
}

/**
 * Extracts the single-resource cost.
 *
 * @param view A policy outcome view.
 * @param source A resource name; e.g., "solar" or "storage".
 * @returns The cost of the given resource ($USD/MWh).
 */
export function resourceCost(view: PolicyDataView, source: PolicyBreakdownEntry) {
  return totalCost(view) * costFraction(view, source);
}

/**
 * Extracts the single-resource cost as a fraction of total scenario cost.
 *
 * @param view A policy outcome view.
 * @param source A resource name; e.g., "solar" or "storage".
 * @returns The fraction of total cost contributed by the given resource.
 */
export function costFraction(view: PolicyDataView, source: PolicyBreakdownEntry) {
  return view.summary.breakdown[source].cost / view.summary.cost;
}

/**
 * Extracts the energy contribution as a fraction of total energy supplied.
 *
 * @param view A policy outcome view.
 * @param source An energy source name; e.g., "solar" or "nuclear".
 * @returns The fraction of total consumed energy contributed by the source.
 */
export function energyFraction(view: PolicyDataView, source: PolicyEnergySource) {
  return view.summary.breakdown[source].energy / view.summary.energy;
}
