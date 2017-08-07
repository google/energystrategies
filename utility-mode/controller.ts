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

/// <reference path="../typings/index.d.ts" />

import * as profiles from './profiles';
import * as util from '../util';
import * as config from './config';
import * as style from '../style';
import * as transforms from '../transforms';
import {OptionToggle} from '../components/toggle';
import {PresetOptionGroup} from '../components/presets';
import {UnmetEnergyDemand} from './unmet-demand';
import {TotalCost} from '../components/cost';
import {Slider} from '../components/slider';
import {CO2GoalChart} from '../components/co2-bar';
import {SupplyDemandProfilesChart} from '../components/energy-profiles';


/**
 * Controller for utility mode.
 */
export class UtilityController {
  _components: UtilityDataComponent[];
  _dataView: UtilityDataView;
  _animateDataView: {(view: UtilityDataView)};
  _useCCS: boolean;
  _profilesChart: SupplyDemandProfilesChart;

  profileDataset: ProfileDataset;
  dataUrl: string;
  _ccsToggles: UtilityEnergySourceSubsetMap<OptionToggle>;

  /**
   * Constructor.
   *
   * @param dataUrl The URL for the utility mode energy profile dataset.
   */
  constructor(dataUrl: string) {
    this.dataUrl = dataUrl;
    this._components = [];
    this._useCCS = false;

    this._animateDataView = util.animate(
        // Calls to animateDataView immediately update the current data view.
        (newView: UtilityDataView) => {
          this._dataView = newView;
        },
        // On animation frame callabcks, the latest data view is rendered.
        () => this._components.forEach(c => {
          c.update(this._dataView)
        }));
  }

  /**
   * Initializes the controller.
   */
  init() {
    d3.json(this.dataUrl, this._handleDataLoaded.bind(this));
  };

  /**
   * Constructs a utility mode data view from the given elements.
   *
   * @param allocations Energy source allocations.
   * @param profiles Energy source profiles.
   * @param outcome Scenario outcome for the given allocations and profiles.
   * @returns A utility data view that packages together the current state.
   */
  _asUtilityDataView(allocations, profiles, outcome): UtilityDataView {
    return {
      allocations: allocations,
      profiles: profiles,
      summary: outcome,
      population: config.POPULATION,
      baseline: config.BASELINE,
      deltaToRef: transforms.deltas(config.BASELINE, outcome)
    };
  }

  _handleDataLoaded(error: Error, profileDataset: ProfileDataset) {
    if (error) {
      throw new Error('Failed to load profile dataset.');
    }

    this.profileDataset = profileDataset;
    console.debug('Loaded energy profile dataset', profileDataset);

    this._initCCSControl();
    this._initComponents();
  }

  _initCCSControl() {
    const ccsToggles: UtilityEnergySourceSubsetMap<OptionToggle> = {
      ng: new OptionToggle(
          <HTMLInputElement>document.getElementById('checkbox-utility-ng-ccs')),
      coal: new OptionToggle(
          <HTMLInputElement>document.getElementById('checkbox-utility-coal-ccs')),
    };

    // Elements that are visually impacted by the state of CCS toggles.
    const ccsContextElements: UtilityEnergySourceSubsetMap<HTMLElement[]> = {
      ng: [document.getElementById('utility-controls-option-ng')],
      coal: [document.getElementById('utility-controls-option-coal')],
    };

    Object.keys(ccsToggles).forEach(source => {
      const toggle: OptionToggle = ccsToggles[source];
      toggle.addChangeListener((enableCCS: boolean) => {
        const ccsSource = source + 'ccs';
        const allocations = this._dataView.allocations;

        // The ccs and non-ccs variants are mutually exclusive, so take the
        // non-zero value between the pair as the source-specific allocation.
        const sourceAllocation = Math.max(
            allocations[source], allocations[ccsSource]);

        // Attribute the corresponding energy source slider to either the
        // ccs-based energy source or the non-ccs source.
        if (enableCCS) {
          allocations[ccsSource] = sourceAllocation;
          allocations[source] = 0;

          ccsContextElements[source].forEach(el => el.classList.add('ccs'));
        } else {
          allocations[ccsSource] = 0;
          allocations[source] = sourceAllocation;

          ccsContextElements[source].forEach(el => el.classList.remove('ccs'));
        }

        this._updateAllocations(allocations);
      });
    });

    this._ccsToggles = ccsToggles;
  }

  _updateAllocations(allocations: ProfileAllocations) {
    // Recompute the utility data view based upon the updated allocations.
    const allocatedProfiles = profiles.getAllocatedEnergyProfiles(
        allocations,
        this.profileDataset);

    const summary = profiles.summarize(allocatedProfiles);
    const newView = this._asUtilityDataView(
        allocations, allocatedProfiles, summary);
    const perMWhBreakdown: any = {};
    config.ALL_ENERGY_SOURCES.forEach(source => {
      const cost = newView.summary.breakdown[source].cost;
      const consumed = newView.summary.breakdown[source].consumed;
      perMWhBreakdown[source] = {
        cost: cost,
        consumed: consumed,
        perMWh: transforms.perMWhCost(cost, consumed * 52),
      }
    });

    this._animateDataView(newView);
  }

  _initComponents() {
    // Create the initial data view.
    const allocations: ProfileAllocations = {
        solar: undefined,
        wind: undefined,
        nuclear: undefined,
        ng: undefined,
        coal: undefined,
        ngccs: undefined,
        coalccs: undefined,
    };
    util.shallowCopy(config.PRESET_ALLOCATIONS.BALANCED, allocations);

    const allocatedProfiles = profiles.getAllocatedEnergyProfiles(
      allocations,
      this.profileDataset);
    const updatedSummary = profiles.summarize(allocatedProfiles);
    const utilityDataView = this._asUtilityDataView(
        allocations, allocatedProfiles, updatedSummary);

    // Create each of the output components.
    this._profilesChart = new SupplyDemandProfilesChart(
        document.getElementById('utility-mode-profiles-chart'),
        utilityDataView,
        {});
    this._components.push(this._profilesChart);
    const CO2_CHART_DATA_CONFIG = {
      max: config.CO2_EMISSIONS_MAX,
      markers: [
        {value: 0, label: ''},
        {value: config.CO2_EMISSIONS_MAX, label: ''},
        {value: config.CO2_EMISSIONS_TODAY, label: 'Today'},
        {value: config.CO2_EMISSIONS_GOAL, label: 'Goal'},
      ]
    };
    this._components.push(new CO2GoalChart(
        document.getElementById('utility-mode-goal-progress'),
        utilityDataView, {
          data: CO2_CHART_DATA_CONFIG,
          bar: {width: 375,},
          ticks: {alignThreshold: 5},
        }));
    this._components.push(new TotalCost(
      document.getElementById('utility-mode-cost')));


    // Create each of the input sliders.
    const sliderFormatter = d3.format('.1f');
    function getDisplayValues(series) {
      const maxPower = d3.max(series); // Megawatts.
      return d3.range(0, 101).map(percent => {
        // Render slider values as Gigawats.
        return sliderFormatter(maxPower / 1000 * (percent / 100));
      });
    }
    const sliders: UtilityEnergySourceSubsetMap<Slider> = {
      solar: new Slider(
          document.getElementById('solar-slider'), 0, 100, 1,
          Math.floor(allocations.solar * 100),
          getDisplayValues(this.profileDataset.series.solar)),
      wind: new Slider(
          document.getElementById('wind-slider'), 0, 100, 1,
          Math.floor(allocations.wind * 100),
          getDisplayValues(this.profileDataset.series.wind)),
      nuclear: new Slider(
          document.getElementById('nuclear-slider'), 0, 100, 1,
          Math.floor(allocations.nuclear * 100),
          getDisplayValues(this.profileDataset.series.nuclear)),
      ng: new Slider(
          document.getElementById('ng-slider'), 0, 100, 1,
          Math.floor(allocations.ng * 100),
          getDisplayValues(this.profileDataset.series.ng)),
      coal: new Slider(
          document.getElementById('coal-slider'), 0, 100, 1,
          Math.floor(allocations.coal * 100),
          getDisplayValues(this.profileDataset.series.coal)),
    };

    this._components.push(new UnmetEnergyDemand([
        document.getElementById('utility-outcome-summary-unmet'),
        document.getElementById('utility-outcome-summary'),
    ]));

    config.SLIDER_ENERGY_SOURCES.forEach(source => {
      sliders[source].addChangeListener(newValue => {
        const newAllocation =  newValue / 100;

        // If the energy source corresponding to the updates slider supports
        // CCS, then check the CCS enable/disable option to see which energy
        // source variant should be allocated by the slider currently.
        //
        // e.g., if coal ccs is enabled, then an update to the coal slider
        // controls the allocation of coalccs directly and the coal allocation
        // is set to zero.
        const ccsToggle = this._ccsToggles[source];
        if (!ccsToggle) {
          // Update the allocations given the new slider setting.
          allocations[source] = newAllocation;
        } else {
          // Find out which variant of the source should be allocated.
          const ccsEnabled = ccsToggle.getValue();
          const ccsSource = source + 'ccs';
          if (ccsEnabled) {
            allocations[ccsSource] = newAllocation;
            allocations[source] = 0;
          } else {
            allocations[ccsSource] = 0;
            allocations[source] = newAllocation;
          }
        }

        this._updateAllocations(allocations);
      });
    });

    // Initialize the preset buttons that can specify slider allocations.
    const presetAllocations = createUtilityPresets(sliders);
    // Automatically deselect the presets whenever the slides are modified to
    // avoid user confusion: "why don't the sliders match the selected preset?".
    Object.keys(sliders).forEach((source: UtilityEnergySource) => {
      sliders[source].addChangeListener(newValue => {
        presetAllocations.deselectAll();
      });
    });

    // Put the sliders into an initial state that fulfills demand.
    presetAllocations.select('BALANCED');
  }
}



function createUtilityPresets(
    sliders: UtilityEnergySourceSubsetMap<Slider>
    ): PresetOptionGroup<config.UtilityPresetOption> {

  const presetElementConfig:
      {[K in config.UtilityPresetOption]: HTMLElement} = {
    NUCLEAR: document.getElementById('preset-util-nuclear'),
    SOLAR: document.getElementById('preset-util-solar'),
    WIND: document.getElementById('preset-util-wind'),
    BALANCED: document.getElementById('preset-util-balanced'),
  };

  // Callback that reconfigures the set of sliders for a given preset
  // allocation.
  const utilityPresetCallback = (presetKey: config.UtilityPresetOption) => {
    // Set each of the sliders to the preset allocation level
    // the outputs are updated due to the slider values changing
    // and triggering onChange callbacks.
    const presetAllocations = config.PRESET_ALLOCATIONS[presetKey];
    config.SLIDER_ENERGY_SOURCES.forEach(source => {
      sliders[source].setValue(100 * presetAllocations[source]);
    });
  };

  return new PresetOptionGroup<config.UtilityPresetOption>(
      presetElementConfig, utilityPresetCallback);
}
