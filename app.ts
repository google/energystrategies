
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
import {NDArrayIndex} from './dataset';
import {DimensionToggle} from './components/dimension-toggle';
import {DimensionSlider} from './components/dimension-slider';
import {ScenarioCO2, ScenarioDeltaCO2} from './components/scenario-co2';
import {ScenarioCost, ScenarioDeltaCost} from './components/scenario-cost';
import {ScenarioCO2GoalChart} from './components/scenario-co2-goal-chart';
import {ScenarioCostGoalChart} from './components/scenario-cost-goal-chart';

// Ambient object declarations and typedefs.
declare var Object: ObjectConstructorES6;


export class App {
  // Defines the reference outcome for relative cost and co2 calculations.
  referenceScenario: ScenarioOutcome;

  // Defines the initial state of the page controls.
  defaultSpec: ScenarioSpec;

  // Provides the scenario data selections that drive the visualizations.
  dataset: DatasetIndex;

  // The current dataset selection corresponding to the scenario spec.
  selection: DatasetSelection;

  // The current scenario specification (set of dimension levels).
  spec: ScenarioSpec;

  // A collection of all page components driven by dataset selection updates.
  components: DatasetSelectionView[];


  constructor(referenceScenario: ScenarioOutcome, defaultSpec: ScenarioSpec) {
    this.referenceScenario = referenceScenario;
    this.defaultSpec = defaultSpec;
    this.spec = Object.assign({}, defaultSpec);

    // The dataset-related members are initialized upon data load.
    this.components = [];
    this.selection = null;
    this.dataset = null;
  }

  init() {
    // Make an async request for the scenario dataset.
    d3.json('data.json', this._handleDataLoad.bind(this));
  }

  /**
   * Request that the app change the given dimension to the specified value.
   *
   * Triggers a data selection update and update of data view components.
   */
  updateDimension(dimension: string, newLevel: number) {
    this.spec[dimension] = newLevel;
    this._updateView();
  }

  _buildOutcomeSummary() {
    const view = this._getPlaygroundView();

    let goal = new ScenarioCO2GoalChart(
        document.getElementById('scenario-goal-chart'), view);
    this.components.push(goal);

    let cost = new ScenarioCostGoalChart(
      document.getElementById('scenario-cost-goal-chart'), view);
    this.components.push(cost);
  }

  /**
   * Builds all page components that are data selection views.
   */
  _buildDatasetSelectionViews() {
    // TODO: refactor to use playground view throughout.
    const playgroundView = this._getPlaygroundView();

    // Find all elements marked as scenario data views and upgrade them to
    // auto-update whenever the current scenario data view changes.
    const nodes = document.querySelectorAll('.scenario-summary');
    const scenarioSummaries = Array.prototype.slice.call(nodes);
    scenarioSummaries.forEach(element => {
      let component: DatasetSelectionView;
      switch (element.dataset.summary) {
        case 'co2':
          component = new ScenarioCO2(element);
          break;
        case 'co2-delta':
          component = new ScenarioDeltaCO2(element);
          break;
        case 'cost':
          component = new ScenarioCost(element);
          break;
        case 'cost-delta':
          component = new ScenarioDeltaCost(element);
          break;
        default:
          console.warn(`Ignoring unsupported scenario summary type \
            ${element.dataset.summary}`);
          // Skip creating and adding this component instance.
          return;
      }
      this.components.push(component);
      component.update(playgroundView);
    });
  }

  /**
   * Builds all page components that are scenario dimension controls.
   */
  _buildDimensionControls() {
    // Find all elements marked as scenario dimension controls and upgrade
    // them to interactive components.
    const dimensionControlNodes = document.querySelectorAll(
      '.dimension-control');

    // Convert NodeList to an Array.
    const dimensionControls = Array.prototype.slice.call(
      dimensionControlNodes);

    dimensionControls.forEach(element => {
      const dimension = element.dataset.dimension;
      const onChangeCallback = this.updateDimension.bind(this, dimension);

      let component: DatasetSelectionView;
      switch (element.dataset.control) {
        case 'slider':
          component = new DimensionSlider(
            element, this.selection, onChangeCallback);
          break;
        case 'toggle':
          component = new DimensionToggle(
            element, this.selection, onChangeCallback);
          break;
        default:
          console.warn(`Ignoring unsupported dimension control type \
            ${element.dataset.control}`);
          // Skip creating and adding this component instance.
          return;
      }
      this.components.push(component);
    });
  }

  /**
   * Gets the current playground view state.
   */
  _getPlaygroundView(): PlaygroundState {
    // Compute the derived values (e.g., deltas to reference).
    const deltas = util.deltas(
      this.referenceScenario, this.selection.scenario);

    const playgroundView = {
      scenario: this.selection.scenario,
      slices: this.selection.slices,
      reference: this.referenceScenario,
      deltaToRef: deltas,
    };

    return playgroundView;
  }

  /**
   * Callback handler invoked when the scenario dataset has been retrieved.
   */
  _handleDataLoad(error: any, data?: Dataset) {
    if (error) {
      console.error('Dataset loading failed');
      throw error;
    }

    // Index the data and extract the initial scenario view.
    this.dataset = new NDArrayIndex(data);
    this.selection = this.dataset.select(this.spec);

    // Render the initial scenario view across page components.
    this._buildDatasetSelectionViews();
    this._buildDimensionControls();
    this._buildOutcomeSummary();
  }

  _updateView() {
    // Fetch a new selection based upon the current scenario spec.
    this.selection = this.dataset.select(this.spec);

    // Update all page components that render aspects of the selection.
    const playgroundView = this._getPlaygroundView();
    this.components.forEach(c => {
      c.update(playgroundView);
    });
  }
}
