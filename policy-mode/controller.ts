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

import * as util from '../util';
import * as transforms from '../transforms';
import * as sweeps from './policy-index';
import * as libpreset from '../components/presets';
import * as config from './config';
import * as share from '../compare-mode/share';
import {TotalCost, BaselineCost, BaselineDeltaCost} from '../components/cost';
import {PolicyBreakdownTable} from '../components/energy-breakdown-table';
import {CO2GoalChart} from '../components/co2-bar';
import {Slider} from '../components/slider';
import {OptionToggle} from '../components/toggle';
import {PresetOptionGroup} from '../components/presets';
import {Promise} from 'es6-promise';
import {DatasetLoader} from './dataset-loader';
import {CompareController} from '../compare-mode/controller';
import {TextView} from '../components/text-view';


/**
 * Controller for policy mode.
 */
export class PolicyController {
  _components: PolicyDataComponent[];
  policyDataset: PolicyDataset;
  sweepIndex: DatasetIndex;
  compareMode: CompareController;
  _displayScales: {[K in PolicyDimension]: string[]};
  _currentDataView: PolicyDataView;
  _sliders: {[K in PolicyDimension]?: Slider};
  _toggles: {[K in PolicyDimension]?: OptionToggle};
  _animateDataView: {(view: PolicyDataView)};
  _presetPolicies: PresetOptionGroup<PolicyPresetKey>;
  _datasetLoader: DatasetLoader;

  constructor(compareMode: CompareController) {
    this.policyDataset = null;
    this._components = [];
    this.compareMode = compareMode;
    this._currentDataView = null;
    this.sweepIndex = null;
    this._presetPolicies = null;
    this._datasetLoader = new DatasetLoader();

    // Wire together the update/render bits into a rate-limited animation
    // frame-based update util.
    this._animateDataView = util.animate(
        this._updateDataView.bind(this),
        this._renderDataView.bind(this));
  }

  /**
   * Fetches the remote policy dataset and initializes policy mode.
   *
   * @param schemaUrl The url to the policy dataset schema.
   * @param scenariosUrl The url to the policy dataset scenarios.
   */
  fetchAndInit(schemaUrl: string, scenariosUrl: string) {
    const datasetPromise = this._datasetLoader.load(schemaUrl, scenariosUrl);
    datasetPromise
      .then((policyDataset: PolicyDataset) => {
        console.debug('[PolicyController] Dataset loaded. Initializing...');
        this.init(policyDataset);
      })
      .catch((reason: any) => {
        console.error('Could not load policy dataset.', reason);
        throw reason;
      });
  }

  /**
   * Initializes the policy mode controller with a given policy dataset.
   *
   * @param policyDataset The policy dataset to render.
   */
  init(policyDataset: PolicyDataset) {
    this.policyDataset = policyDataset;

    // Index the scenarios by config levels.
    this.sweepIndex = new sweeps.NDArrayIndex(this.policyDataset);
    console.debug('Indexed policy dataset sweeps', this.sweepIndex);

    // Select an initial policy configuration for the page.
    //
    // If the URL already contains an application state token, load the policy
    // specified by the state token instead of the default initial policy.
    let initialPolicy = config.INITIAL_POLICY;
    const urlState = share.readAppStateFromUrl(policyDataset.schema, window.location);
    if (urlState) {
      console.info('Loading policy state from url token: ', urlState.policy);
      initialPolicy = urlState.policy
    } else {
      console.info('No url state; using default initial policy: ', initialPolicy);
    }

    // Initialize all page components.
    this._initDisplayScales();
    this._initComponents(initialPolicy);
    // Initialize compare mode, which renders the current state of policy mode
    // alongside static data.
    this._initCompareMode();
    // Put the UI controls into a known state and render all page components.
    this._applyPolicyConfigToControls(initialPolicy);

    // Hide the "loading dataset" modal and show the policy outcome content.
    const content = document.getElementById('policy-mode-explorer');
    const loader = document.getElementById('policy-mode-loading');
    loader.classList.remove('loading');
    content.classList.remove('loading');
  }

  /**
   * Sets each of the per-dimension UI controls to the specified level.
   *
   * This operation has the side effect of indirectly updating the data
   * view and outcomes to match the specified policy choices.
   *
   * @param newConfig Policy choices to implement.
   */
  _applyPolicyConfigToControls(newConfig: PolicyConfig) {
    this.policyDataset.schema.dimensions.forEach(dimension => {
      const newDimensionLevel = newConfig[dimension];

      const slider = this._sliders[dimension];
      if (slider) {
        slider.setValue(newDimensionLevel);
        return;
      }

      const toggle: OptionToggle = this._toggles[dimension];
      if (toggle) {
        toggle.setValue(Boolean(newDimensionLevel));
        return;
      }

      // Unhandled dimension... fail
      throw new Error(
          `Unsupported configuration preset dimension "${dimension}".`);
    });
  }

  _getDataView(choices: PolicyConfig): PolicyDataView {
    const policySummary = this.sweepIndex.select(choices);

    // Extract the baseline outcome from the flattened row representation.
    const BASELINE = sweeps.parsePolicyRowCSV(
        this.policyDataset.schema.baseline, this.policyDataset.schema)
    return {
      choices: choices,
      summary: policySummary,
      population: this.policyDataset.schema.population,
      baseline: BASELINE,
      deltaToRef: transforms.deltas(BASELINE, policySummary),
    };
  };

  _handlePresetSelect(presetKey: PolicyPresetKey) {
    this._applyPolicyConfigToControls(config.PRESET_POLICY[presetKey]);
  }

  _initDisplayScales() {
    // Basically, these are the formatted display strings
    const booleanDisplayScales = ['False', 'True'];
    this._displayScales = {
      nuclear_allowed: booleanDisplayScales,
      storage_allowed: booleanDisplayScales,
      rps_includes_carbon_capture: booleanDisplayScales,
      rps_includes_nuclear_energy: booleanDisplayScales,
      rps: this.policyDataset.schema.scales.rps.map(p => `${p.toFixed(0)}%`),
      carbon_tax: this.policyDataset.schema.scales.carbon_tax.map(
              t => `$${t.toFixed(0)}/t`),
      solar_price: this.policyDataset.schema.scales.solar_price.map(n => 'Solar farm'),
      wind_price: this.policyDataset.schema.scales.wind_price.map(n => 'Wind farm'),
      nuclear_price: this.policyDataset.schema.scales.nuclear_price.map(n => 'Nuclear plant'),
      ng_price: this.policyDataset.schema.scales.ng_price.map(n => 'Natural gas fuel'),
    };
  }

  _initCompareMode() {
    // Fetch the policy outcomes for all preset policies (must be superset-equal
    // for compare page needs).
    const referencePolicyViews = {};
    Object.keys(config.PRESET_POLICY).forEach(name => {
      referencePolicyViews[name] = this._getDataView(
          config.PRESET_POLICY[name]);
    });
    // Initialize the comparison mode with the possible outcomes.
    this.compareMode.init(
        // Full set of available policies.
        referencePolicyViews,
        // Initial policy mode configuration is the initial compare policy.
        this._currentDataView);
  }

  _renderDataView() {
    // Update the visual components to match the current data view state.
    this._components.forEach(c => c.update(this._currentDataView));

    // Update the window url to capture the current page state.
    const newAppState = {
      policy: this._currentDataView.choices,
    };
    share.updateUrlForAppState(
        newAppState,
        this.policyDataset.schema,
        window.location,
        window.history);
  }

  _updateDataView(newView: PolicyDataView) {
    // Save a copy of the current data view state for any delayed renderers
    this._currentDataView = newView;
  }

  _updateDimension(dimension: string, newLevel: number) {
    // Update the current policy choice selection.
    const policyChoices = {};
    util.shallowCopy(this._currentDataView.choices, policyChoices);
    policyChoices[dimension] = newLevel;

    // Update the data view and components that render from it.
    this._animateDataView(this._getDataView(<PolicyConfig>policyChoices));

    // Deselect all of the presets any time a control is modified to avoid user
    // confusion (e.g., controls state != selected preset state).
    this._presetPolicies.deselectAll();
  }


  _initComponents(initialPolicy: PolicyConfig) {
    // Maintain the current data view state independent of component rendering
    // to buffer changes and keep the UI responsive.
    this._currentDataView = this._getDataView(initialPolicy);

    // Create each of the output components.
    const mainComponents: PolicyDataComponent[] = [
      new BaselineCost(document.getElementById('policy-mode-cost-eq-baseline')),
      new BaselineDeltaCost(document.getElementById('policy-mode-cost-eq-delta')),
      new TotalCost(document.getElementById('policy-mode-cost-eq-total')),
      new CO2GoalChart(document.getElementById('policy-mode-goal-chart'),
        this._currentDataView, {
          data: {
            max: this.policyDataset.schema.stats.co2.max,
            markers: [
              {value: 0, label: ''},
              {value: this.policyDataset.schema.stats.co2.max, label: ''},
              {value: config.CO2_EMISSIONS_MAX_NG, label: 'Max NG'},
              {value: config.CO2_EMISSIONS_TODAY_ACTUAL, label: 'Today'},
              {value: config.CO2_EMISSIONS_GOAL, label: 'Goal'},
            ]
          },
          bar: {height: 40, width: 760},
          padding: {bottom: 50},
          text: {offset: {y: 6}}
      }),
      new PolicyBreakdownTable(
          document.getElementById('policy-mode-breakdown-table'),
          this._currentDataView,
          config.ALL_COST_SOURCES,
          config.POLICY_BREAKDOWN_DISPLAY_NAMES),
      new TextView(document.getElementById('ng-cost-slider-value'),
          view => config.dimensionLevelFormatters.ng_price(
              view.choices.ng_price)),
      new TextView(document.getElementById('solar-cost-slider-value'),
          view => config.dimensionLevelFormatters.solar_price(
              view.choices.solar_price)),
      new TextView(document.getElementById('wind-cost-slider-value'),
          view => config.dimensionLevelFormatters.wind_price(
              view.choices.wind_price)),
      new TextView(document.getElementById('nuclear-cost-slider-value'),
          view => config.dimensionLevelFormatters.nuclear_price(
              view.choices.nuclear_price)),
    ];
    mainComponents.forEach(c => this._components.push(c));

    // Create the preset configuration choice buttons.
    this._presetPolicies = createPolicyPresets(
        this._handlePresetSelect.bind(this));

    // Create each of the input sliders.
    this._sliders = {
      rps: new Slider(
          document.getElementById('ces-slider'),
          0, this.policyDataset.schema.scales.rps.length - 1, 1,
          this._currentDataView.choices.rps,
          this._displayScales.rps),
      carbon_tax: new Slider(
          document.getElementById('carbon-tax-slider'),
          0, this.policyDataset.schema.scales.carbon_tax.length - 1, 1,
          this._currentDataView.choices.carbon_tax,
          this._displayScales.carbon_tax),
      solar_price: new Slider(
          document.getElementById('solar-cost-slider'),
          0, this.policyDataset.schema.scales.solar_price.length - 1, 1,
          this._currentDataView.choices.solar_price,
          this._displayScales.solar_price),
      wind_price: new Slider(
          document.getElementById('wind-cost-slider'),
          0, this.policyDataset.schema.scales.wind_price.length - 1, 1,
          this._currentDataView.choices.wind_price,
          this._displayScales.wind_price),
      nuclear_price: new Slider(
          document.getElementById('nuclear-cost-slider'),
          0, this.policyDataset.schema.scales.nuclear_price.length - 1, 1,
          this._currentDataView.choices.nuclear_price,
          this._displayScales.nuclear_price),
      ng_price: new Slider(
          document.getElementById('ng-cost-slider'),
          0, this.policyDataset.schema.scales.ng_price.length - 1, 1,
          this._currentDataView.choices.ng_price,
          this._displayScales.ng_price),
    };
    // Add slider change event handlers.
    Object.keys(this._sliders).forEach(dimension => {
      this._sliders[dimension].addChangeListener(newLevel => {
        // Select a new data view for the changed dimension.
        this._updateDimension(dimension, newLevel);
      });
    });
    // Create each of the input toggles (checkboxes currently).
    this._toggles = {
      rps_includes_carbon_capture: new OptionToggle(
          <HTMLInputElement>document.getElementById('checkbox-ccs-is-clean')),
      rps_includes_nuclear_energy: new OptionToggle(
          <HTMLInputElement>document.getElementById('checkbox-nuclear-is-clean')),
      nuclear_allowed: new OptionToggle(
          <HTMLInputElement>document.getElementById('checkbox-nuclear-is-allowed')),
      storage_allowed: new OptionToggle(
          <HTMLInputElement>document.getElementById('checkbox-storage-is-allowed')),
    }

    // Setup change event handlers for all of the toggles so that modifying a
    // toggle reconfigures and updates the scenario outcome.
    Object.keys(this._toggles).forEach(dimension => {
      this._toggles[dimension].addChangeListener(newValue => {
        // Map the option value (boolean) to the corresponding int level.
        const newLevel = Number(newValue);
        this._updateDimension(dimension, newLevel);
      });
    });

    // A few controls are related to modulating nuclear energy policy and should
    // be disabled when nuclear power has been disabled per user policy.
    this._toggles.nuclear_allowed.addChangeListener(isNuclearAllowed => {
      if (isNuclearAllowed) {
        this._sliders.nuclear_price.enable();
        this._toggles.rps_includes_nuclear_energy.enable();
      } else {
        this._sliders.nuclear_price.disable();
        this._toggles.rps_includes_nuclear_energy.disable();
      }
    });

    const modeButtons = {
      policy: [
        document.getElementById('go-to-policy-mode-button')
      ],
      utility: [
        document.getElementById('go-to-utility-mode-button'),
        document.getElementById('go-to-utility-mode-button-2'),
      ],
      compare: [
        document.getElementById('go-to-compare-mode-button'),
      ]
    };

    // Add event handler for updating the compare mode page when transitioning.
    //
    // i.e., don't update any compare mode page components when the compare
    // page is not visible, just sync the state when required.
    modeButtons.compare.forEach(compareButton => {
      compareButton.addEventListener('click', (event: Event) => {
        console.debug('[click] go-to-compare-mode', this._currentDataView);
        this.compareMode.update(this._currentDataView);
      });
    });
  }
}


function createPolicyPresets(
    onPresetSelectCallback: {(presetKey: PolicyPresetKey)}) {
  const presetElementConfig: {[K in PolicyPresetKey]: HTMLElement} = {
    BALANCED_LOW_CARBON: document.getElementById('preset-balanced-low-carbon'),
    FAVOR_RENEWABLES: document.getElementById('preset-favor-renewables'),
    FAVOR_CARBON_CAPTURE: document.getElementById('preset-favor-carbon-capture'),
    FAVOR_NUCLEAR: document.getElementById('preset-favor-nuclear'),
  };

  return new PresetOptionGroup<PolicyPresetKey>(
      presetElementConfig, onPresetSelectCallback);
}
