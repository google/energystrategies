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


// Declare that we expect ES6 Object features to be available.
declare const Object: ObjectConstructorES6;

export const shallowCopy = (source: Object, dest: Object) => {
    return Object.assign(dest, source);
};

export const deltas = (baseline: ScenarioOutcome, current: ScenarioOutcome) => {
    function delta(ref, value) {
        return (value - ref) / ref;
    }

    return {
        co2: delta(baseline.co2, current.co2),
        cost: delta(baseline.cost, current.cost),
    };
};

// TODO: need to "show the work" on this formulation somewhere.
const MONTHLY_COST_PER_HOUSEHOLD_DIVISOR = 2.083e9;
export const asMonthlyPerHouseholdCost = (totalCost: number) => {
    return totalCost / MONTHLY_COST_PER_HOUSEHOLD_DIVISOR;
};