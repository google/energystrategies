
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

import {EnergyProfileChart} from './components/energy-profile-chart';
import {ScenarioCost} from './components/cost';
import {Slider} from './components/slider';
import {CO2GoalProgress} from './components/goal-progress';
import * as profiles from './profiles';
import * as util from './util';
import * as config from './config';

// Ambient object declarations and typedefs.
declare var Object: ObjectConstructorES6;


export class UtilityMode {
  components: UtilityDataComponent[];
  profileDataset: ProfileDataset;
  dataUrl: string;

  constructor(dataUrl: string) {
    this.dataUrl = dataUrl;
    this.components = [];
  }

  init() {
    d3.json(this.dataUrl, this._handleDataLoaded.bind(this));
  };

  _handleDataLoaded(error: Error, profileDataset: ProfileDataset) {
    if (error) {
      throw new Error('Failed to load profile dataset.');
    }

    this.profileDataset = profileDataset;
    console.debug('Loaded profile dataset', profileDataset);

    this._initComponents();
  }

  _initComponents() {
    // Create the initial data view.
    const allocations = {
        solar: 0.25, wind: 0.25, ng: 0.8, nuclear: 0.1
    };
    const allocatedProfiles = profiles.getAllocatedEnergyProfiles(
      allocations,
      this.profileDataset);
    const updatedSummary = profiles.summarize(allocatedProfiles);
    const utilityDataView: UtilityDataView = {
      allocations: allocations,
      profiles: allocatedProfiles,
      summary: updatedSummary,
      deltaToRef: util.deltas(config.NAMED_SCENARIOS.reference, updatedSummary)
    };

    // Create each of the output components.
    const profilesChart = new EnergyProfileChart(
      document.getElementById('utility-mode-profiles-chart'), utilityDataView);
    const headlineCost = new ScenarioCost(
      document.getElementById('utility-mode-cost'));
    const goal = new CO2GoalProgress(
      document.getElementById('utility-mode-goal-progress'));
    const utilityModeComponents = [goal, headlineCost, profilesChart];
    utilityModeComponents.forEach(c => c.update(utilityDataView));

    // Create each of the input sliders.
    const sliders = {
      solar: new Slider(
          document.getElementById('solar-slider'), 0, 100, 1, 50),
      wind: new Slider(
          document.getElementById('wind-slider'), 0, 100, 1, 50),
      nuclear: new Slider(
            document.getElementById('nuclear-slider'), 0, 100, 1, 50),
      ng: new Slider(
            document.getElementById('ng-slider'), 0, 100, 1, 50),
    };

    config.ALL_ENERGY_SOURCES.forEach(source => {
      sliders[source].addChangeListener(newValue => {
        // Update the allocations given the new slider setting.
        allocations[source] = newValue / 100;
        // Recompute the utility data view based upon the updated allocations.
        const newProfiles = profiles.getAllocatedEnergyProfiles(
          allocations, this.profileDataset);
        const newSummary = profiles.summarize(newProfiles);
        const newView: UtilityDataView = {
          allocations: allocations,
          profiles: newProfiles,
          summary: newSummary,
          deltaToRef: util.deltas(config.NAMED_SCENARIOS.reference, newSummary)
        };

        // Update the output components.
        utilityModeComponents.forEach(c => c.update(newView));
      });
    });
  }
}



