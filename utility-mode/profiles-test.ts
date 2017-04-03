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


import * as profiles from './profiles';
import * as config from './config';
import * as util from '../util';


describe('Get allocated energy profiles', () => {
  let profileData: ProfileDataset;

  beforeEach(() => {
    profileData = {
      index: [0, 1, 2],
      units: 'MWh',
      series: {
        demand: [10, 0, 20],
        nuclear: [8, 8, 8],
        solar: [6, 2, 0],
        wind: [4, 8, 0],
        ng: [10, 10, 10],
        coal: [1, 1, 1],
        unmet: [0, 0, 0],
      }
    };
  });

  it('when all allocations are non-zero', () => {
    // Allocate half of each energy supply profile.
    const allocated = profiles.getAllocatedEnergyProfiles({
      nuclear: 0.5,
      solar: 0.5,
      wind: 0.5,
      ng: 0.5,
      coal: 0.5,
    }, profileData);

    // Verify that non-dispatchable energy supply profiles
    // are halved.
    expect(allocated.series.solar).toEqual([3, 1, 0]);
    expect(allocated.series.wind).toEqual([2, 4, 0]);
    expect(allocated.series.nuclear).toEqual([4, 4, 4]);
    expect(allocated.series.coal).toEqual([0.5, 0.5, 0.5]);

    // The only dispatchable energy supply should be between
    // 0 and half of the available dispatchable allocations
    // (capped by demand).
    expect(allocated.series.ng).toEqual([0.5, 0, 5]);

    // There should only be unmet demand at the last time point.
    //
    // unmet[t] := demand[t] - non_dispatchables[t] - dispatchles[t]
    expect(allocated.series.unmet).toEqual([0, 0, 20 - 4 - 5 - 0.5]);

    // Verify the pass-through attributes are unchanged.
    expect(allocated.index).toEqual([0, 1, 2]);
    expect(allocated.units).toEqual('MWh');
    expect(allocated.series.demand).toEqual([10, 0, 20]);
  });

  it('when all allocations are zero', () => {
    const allocated = profiles.getAllocatedEnergyProfiles({
      nuclear: 0,
      solar: 0,
      wind: 0,
      ng: 0,
      coal: 0,
    }, profileData);

    // The unmet profile should match the demand profile.
    expect(allocated.series.unmet).toEqual([10, 0, 20]);

    // All energy supply profiles should be zeroed out.
    expect(allocated.series.nuclear).toEqual([0, 0, 0]);
    expect(allocated.series.solar).toEqual([0, 0, 0]);
    expect(allocated.series.wind).toEqual([0, 0, 0]);
    expect(allocated.series.ng).toEqual([0, 0, 0]);

    expect(allocated.series.demand).toEqual([10, 0, 20]);
    expect(allocated.units).toEqual('MWh');
    expect(allocated.index).toEqual([0, 1, 2]);
  });

  it('when all allocations are 100%', () => {
    const allocated = profiles.getAllocatedEnergyProfiles({
      nuclear: 1,
      solar: 1,
      wind: 1,
      ng: 1,
      coal: 1,
    }, profileData);

    // All non-dispatchable energy profiles should match the originals.
    expect(allocated.series.nuclear).toEqual([8, 8, 8]);
    expect(allocated.series.solar).toEqual([6, 2, 0]);
    expect(allocated.series.wind).toEqual([4, 8, 0]);

    // Dispatchable energy source capped by demand.
    //
    // dispatch[t] = demand[t] - avalable_dispath[t] - nondispatch[t]
    expect(allocated.series.ng).toEqual([0, 0, 10]);

    // Even with full allocation, there is unmet demand at the last time point.
    expect(allocated.series.unmet).toEqual([0, 0, 1]);

    // Verify pass-through attributes are unchanged.
    expect(allocated.index).toEqual([0, 1, 2]);
    expect(allocated.units).toEqual('MWh');
    expect(allocated.series.demand).toEqual([10, 0, 20]);
  });

  it('when all non-dispatchables are zero', () => {
    const allocated = profiles.getAllocatedEnergyProfiles({
      nuclear: 0,
      solar: 0,
      wind: 0,
      ng: 1,
      coal: 0,
    }, profileData);

    // All non-dispatchable energy profiles should be zeroed out.
    expect(allocated.series.nuclear).toEqual([0, 0, 0]);
    expect(allocated.series.solar).toEqual([0, 0, 0]);
    expect(allocated.series.wind).toEqual([0, 0, 0]);

    // For all t, ng should be: min(ng_capacity[t], demand[t]).
    expect(allocated.series.ng).toEqual([10, 0, 10]);

    // Verify pass-through attributes are unchanged.
    expect(allocated.index).toEqual([0, 1, 2]);
    expect(allocated.series.demand).toEqual([10, 0, 20]);
    expect(allocated.units).toEqual('MWh');

    // Even at full capacity ng cannot meet demand at last time point.
    expect(allocated.series.unmet).toEqual([0, 0, 10]);
  });
});

describe('Energy generation used for supplying demand', () => {

  it('when there is never an excess.', () => {
    const profileData: ProfileDataset = {
      index: [0, 1, 2],
      units: 'MWh',
      series: {
        demand: [100, 100, 100],
        nuclear: [8, 8, 8],
        solar: [6, 2, 0],
        wind: [4, 8, 0],
        coal: [0, 0, 0],
        // Note that dispatch has already been taken into account here.
        ng: [10, 10, 10],
        unmet: [0, 0, 0],
      }
    };

    const supplied = profiles.getSuppliedEnergyBreakdown(profileData);

    // All dispatched energy is used for fulfilling demand.
    expect(supplied['ng']).toBeCloseTo(30);

    // There should never be any generation in excess of demand, so the
    // generation profile matches the supplied energy profile for
    // each non-dispatchable source in this case.
    expect(supplied['nuclear']).toBeCloseTo(8 + 8 + 8);
    expect(supplied['wind']).toBeCloseTo(4 + 8 + 0);
    expect(supplied['solar']).toBeCloseTo(6 + 2 + 0);
  });

  it('when there is an excess in generation.', () => {
    const profileData: ProfileDataset = {
      index: [0, 1, 2],
      units: 'MWh',
      series: {
        demand: [10, 0, 20],
        nuclear: [8, 8, 8],
        solar: [6, 2, 0],
        wind: [4, 8, 0],
        coal: [0, 0, 0],
        // Note that dispatch has already been taken into account here.
        ng: [0, 0, 10],
        unmet: [0, 0, 0],
      }
    };

    const supplied = profiles.getSuppliedEnergyBreakdown(profileData);

    // All dispatched energy is used for fulfilling demand.
    expect(supplied['ng']).toBeCloseTo(10);

    // If any excess demand is generated, each non-dispatchable source should
    // be attributed a weighted fraction at each time point where excess
    // occurred.
    //
    // Total (expected) excess generation series: [8, 18, 0]
    expect(supplied['nuclear']).toBeCloseTo(
      // Each line below is verifying the following computation:
      // supplied[t][i] = gen[t][i] - gen[t][i] * excess[t] / gen[t]
      8 - 8 * 8 / 18  // t0
      + 8 - 8 * 18 / 18  // t1
      + 8 - 0  // t2
    );

    expect(supplied['wind']).toBeCloseTo(
      4 - 4 * 8 / 18  // t0
      + 8 - 8 * 18 / 18 // t1
      + 0 - 0  // t2
    );

    expect(supplied['solar']).toBeCloseTo(
      6 - 6 * 8 / 18  // t0
      + 2 - 2 * 18 / 18  // t1
      + 0 - 0  // t2
    );
  });
});


describe('Summarize energy profile', () => {
  let profileData: ProfileDataset;
  let summarized: ScenarioOutcomeBreakdown<UtilityEnergySource>;

  beforeEach(() => {
    profileData = {
      index: [0, 1, 2],
      units: 'MWh',
      series: {
        demand: [10, 0, 20],
        nuclear: [8, 8, 8],
        solar: [6, 2, 0],
        wind: [4, 8, 0],
        ng: [10, 10, 10],
        coal: [0, 0, 0],
        unmet: [0, 0, 0],
      }
    };
    summarized = profiles.summarize(profileData);
  });

  it('energy generation.', () => {
    // Quantities related to energy generation.
    expect(summarized.breakdown.nuclear.energy).toEqual(24);
    expect(summarized.breakdown.nuclear.variableCost).toBeCloseTo(
        config.VARIABLE_COST.nuclear * util.DISCOUNT_RATE_WEEKLY * 24);
  });

  it('energy capacity.', () => {
    // Quantities related to energy capacity.
    expect(summarized.breakdown.nuclear.capacity).toEqual(8);
    expect(summarized.breakdown.nuclear.fixedCost).toEqual(
        config.FIXED_COST.nuclear * 8);
  });

  it('when all energy sources have zeroed profiles.', () => {
    // Zero the energy profile for each available source.
    const zeroProfiles = profiles.getAllocatedEnergyProfiles({
        nuclear: 0,
        solar: 0,
        wind: 0,
        ng: 0,
        coal: 0,
    }, profileData);
    const zeroed = profiles.summarize(zeroProfiles);

    // No energy was generated, so the profile summary should reflect
    // zero cost and co2 generation for all energy sources.
    expect(zeroed.co2).toEqual(0);
    expect(zeroed.cost).toEqual(0);

    config.ALL_ENERGY_SOURCES.forEach(energySource => {
      expect(zeroed.breakdown[energySource].energy).toEqual(0);
      expect(zeroed.breakdown[energySource].capacity).toEqual(0);
      expect(zeroed.breakdown[energySource].co2).toEqual(0);
      expect(zeroed.breakdown[energySource].fixedCost).toEqual(0);
      expect(zeroed.breakdown[energySource].variableCost).toEqual(0);
    });
  });
});