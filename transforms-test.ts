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

import * as transforms from './transforms';


const discounted = x => x * transforms.DISCOUNT_RATE_YEARLY;

describe('Total cost per MWh', () => {
  it('', () => {
    expect(transforms.totalCost({
      summary: {
        cost: discounted(100),
        energy: 20,
        co2: 0,
        breakdown: null
      },
      deltaToRef: null,
      population: null,
      baseline: null,
    })).toBeCloseTo(5, 0);
  });
});

describe('Baseline cost per MWh', () => {
  it('', () => {
    expect(transforms.baselineCost({
      baseline: {
        cost: discounted(100),
        energy: 20,
        co2: 0,
        breakdown: null
      },
      summary: null,
      deltaToRef: null,
      population: null,
    })).toBeCloseTo(5, 0);
  });
});

describe('Delta from Baseline cost per MWh', () => {
  it('when both baseline == current', () => {
    expect(transforms.baselineDeltaCost({
      summary: {
        cost: discounted(100),
        energy: 20,
        co2: 0,
        breakdown: null
      },
      baseline: {
        cost: discounted(100),
        energy: 20,
        co2: 0,
        breakdown: null
      },
      deltaToRef: null,
      population: null,
    })).toBeCloseTo(0, 0);
  });

  it('when both baseline > current', () => {
    expect(transforms.baselineDeltaCost({
      summary: {
        cost: discounted(100),
        energy: 20,
        co2: 0,
        breakdown: null
      },
      baseline: {
        cost: discounted(140),
        energy: 20,
        co2: 0,
        breakdown: null
      },
      deltaToRef: null,
      population: null,
    })).toBeCloseTo(-2, 0);
  });

  it('when both baseline < current', () => {
    expect(transforms.baselineDeltaCost({
      summary: {
        cost: discounted(100),
        energy: 20,
        co2: 0,
        breakdown: null
      },
      baseline: {
        cost: discounted(40),
        energy: 20,
        co2: 0,
        breakdown: null
      },
      deltaToRef: null,
      population: null,
    })).toBeCloseTo(3, 0);
  });
});

describe('Single resource cost contribution per MWh', () => {
  it('when resource is a fraction of total', () => {
    const view = {
      summary: {
        cost: discounted(100),
        energy: 20,
        co2: 0,
        breakdown: {
          solar: {cost: discounted(50), energy: 20, co2: 0},
          wind: {cost: 0, energy: 0, co2: 0},
          nuclear: {cost: 0, energy: 0, co2: 0},
          ng: {cost: 0, energy: 0, co2: 0},
          ngccs: {cost: 0, energy: 0, co2: 0},
          coal: {cost: 0, energy: 0, co2: 0},
          coalccs: {cost: 0, energy: 0, co2: 0},
          hydro: {cost: 0, energy: 0, co2: 0},
          storage: {cost: discounted(50), energy: 0, co2: 0},
        }
      },
      baseline: null,
      deltaToRef: null,
      population: null,
      choices: null,
    };

    expect(transforms.resourceCost(view, 'solar')).toBeCloseTo(2.5, 1);
    expect(transforms.resourceCost(view, 'storage')).toBeCloseTo(2.5, 1);
    expect(transforms.resourceCost(view, 'wind')).toBeCloseTo(0, 1);
  });
  it('when a single resource is 100% of total', () => {
    const view = {
      summary: {
        cost: discounted(100),
        energy: 20,
        co2: 0,
        breakdown: {
          solar: {cost: discounted(100), energy: 20, co2: 0},
          wind: {cost: 0, energy: 0, co2: 0},
          nuclear: {cost: 0, energy: 0, co2: 0},
          ng: {cost: 0, energy: 0, co2: 0},
          ngccs: {cost: 0, energy: 0, co2: 0},
          coal: {cost: 0, energy: 0, co2: 0},
          coalccs: {cost: 0, energy: 0, co2: 0},
          hydro: {cost: 0, energy: 0, co2: 0},
          storage: {cost: 0, energy: 0, co2: 0},
        }
      },
      baseline: null,
      deltaToRef: null,
      population: null,
      choices: null,
    };

    expect(transforms.resourceCost(view, 'solar')).toBeCloseTo(5, 1);
    expect(transforms.resourceCost(view, 'storage')).toBeCloseTo(0, 1);
    expect(transforms.resourceCost(view, 'wind')).toBeCloseTo(0, 1);
  });
});

describe('Single resource cost fraction', () => {
  it('when resource is a fraction of total', () => {
    const view = {
      summary: {
        cost: discounted(100),
        energy: 20,
        co2: 0,
        breakdown: {
          solar: {cost: discounted(50), energy: 20, co2: 0},
          wind: {cost: 0, energy: 0, co2: 0},
          nuclear: {cost: 0, energy: 0, co2: 0},
          ng: {cost: 0, energy: 0, co2: 0},
          ngccs: {cost: 0, energy: 0, co2: 0},
          coal: {cost: 0, energy: 0, co2: 0},
          coalccs: {cost: 0, energy: 0, co2: 0},
          hydro: {cost: 0, energy: 0, co2: 0},
          storage: {cost: discounted(50), energy: 0, co2: 0},
        }
      },
      baseline: null,
      deltaToRef: null,
      population: null,
      choices: null,
    };

    expect(transforms.costFraction(view, 'solar')).toBeCloseTo(.5, 1);
    expect(transforms.costFraction(view, 'storage')).toBeCloseTo(.5, 1);
    expect(transforms.costFraction(view, 'wind')).toBeCloseTo(0, 1);
  });
  it('when a single resource is 100% of total', () => {
    const view = {
      summary: {
        cost: discounted(100),
        energy: 20,
        co2: 0,
        breakdown: {
          solar: {cost: discounted(100), energy: 20, co2: 0},
          wind: {cost: 0, energy: 0, co2: 0},
          nuclear: {cost: 0, energy: 0, co2: 0},
          ng: {cost: 0, energy: 0, co2: 0},
          ngccs: {cost: 0, energy: 0, co2: 0},
          coal: {cost: 0, energy: 0, co2: 0},
          coalccs: {cost: 0, energy: 0, co2: 0},
          hydro: {cost: 0, energy: 0, co2: 0},
          storage: {cost: 0, energy: 0, co2: 0},
        }
      },
      baseline: null,
      deltaToRef: null,
      population: null,
      choices: null,
    };

    expect(transforms.costFraction(view, 'solar')).toBeCloseTo(1, 1);
    expect(transforms.costFraction(view, 'storage')).toBeCloseTo(0, 1);
    expect(transforms.costFraction(view, 'wind')).toBeCloseTo(0, 1);
  });
});

describe('Single resource energy fraction', () => {
  it('when resource is a fraction of total', () => {
    const view = {
      summary: {
        cost: discounted(100),
        energy: 20,
        co2: 0,
        breakdown: {
          solar: {cost: discounted(50), energy: 10, co2: 0},
          wind: {cost: discounted(50), energy: 10, co2: 0},
          nuclear: {cost: 0, energy: 0, co2: 0},
          ng: {cost: 0, energy: 0, co2: 0},
          ngccs: {cost: 0, energy: 0, co2: 0},
          coal: {cost: 0, energy: 0, co2: 0},
          coalccs: {cost: 0, energy: 0, co2: 0},
          hydro: {cost: 0, energy: 0, co2: 0},
          storage: {cost: 0, energy: 0, co2: 0},
        }
      },
      baseline: null,
      deltaToRef: null,
      population: null,
      choices: null,
    };

    expect(transforms.energyFraction(view, 'solar')).toBeCloseTo(.5, 1);
    expect(transforms.energyFraction(view, 'wind')).toBeCloseTo(.5, 1);
    expect(transforms.energyFraction(view, 'nuclear')).toBeCloseTo(0, 1);
  });
  it('when a single resource is 100% of total', () => {
    const view = {
      summary: {
        cost: discounted(100),
        energy: 20,
        co2: 0,
        breakdown: {
          solar: {cost: discounted(100), energy: 20, co2: 0},
          wind: {cost: 0, energy: 0, co2: 0},
          nuclear: {cost: 0, energy: 0, co2: 0},
          ng: {cost: 0, energy: 0, co2: 0},
          ngccs: {cost: 0, energy: 0, co2: 0},
          coal: {cost: 0, energy: 0, co2: 0},
          coalccs: {cost: 0, energy: 0, co2: 0},
          hydro: {cost: 0, energy: 0, co2: 0},
          storage: {cost: 0, energy: 0, co2: 0},
        }
      },
      baseline: null,
      deltaToRef: null,
      population: null,
      choices: null,
    };

    expect(transforms.energyFraction(view, 'solar')).toBeCloseTo(1, 1);
    expect(transforms.energyFraction(view, 'wind')).toBeCloseTo(0, 1);
  });
});

describe('Per Megawatt-hour cost', () => {
  it('when total lifetime cost is attributed to yearly consumption', () => {
    // Hypothetical scenario being tested here:
    //
    // Assume a region contains 100 households, each consuming 1 MWh/month
    // at a cost of 12 cents/kWh, for a regional consumption of 1200 MWh/year.
    //
    // The above costs $144k/year and is then repeated for the 30-year lifetime
    // of the infrastructure at 6% discount rate to get a total lifetime cost
    // of ~$2.1M for the region.
    const cost = 2.1e6;  // The total lifetime cost over 30 years.
    const yearlyEnergyConsumption = 1200;  // Consumed energy in MWh.
    const expectedCostPerMWh = 120;
    expect(transforms.perMWhCost(cost, yearlyEnergyConsumption))
        .toBeCloseTo(expectedCostPerMWh, 0);
  });
})

describe('Monthly per household cost', () => {
  it('when total lifetime cost is attributed to regional population.', () => {
    // Hypothetical scenario being tested here:
    //
    // Assume a region contains 100 households, each consuming 1 MWh/month
    // at a cost of 12 cents/kWh, for a regional consumption of 1200 MWh/year.
    //
    // The above costs $144k/year and is then repeated for the 30-year lifetime
    // of the infrastructure at 6% discount rate to get a total lifetime cost
    // of ~$2.1M for the region.
    const cost = 2.1e6;  // The total lifetime cost over 30 years.
    const peoplePerHousehold = 2.53;
    const population = 100 * peoplePerHousehold;
    const expectedCostPerMWh = 120;
    expect(transforms.asMonthlyPerHouseholdCost(cost, population))
        .toBeCloseTo(expectedCostPerMWh, 0);
  });
});