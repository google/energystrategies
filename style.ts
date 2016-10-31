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


export const COLORS = {
  // Material design lite default blue.
  PRIMARY: '#3f51b5',
  ACCENT_PRIMARY: '#8C9EFF',
  LIGHT_GRAY: '#dfdfdf',
  WHITE: '#fff',
  BLACK: '#000',

  // Failure indication color.
  FAILURE: '#FF1744',

  // Energy source colors.
  SOLAR: '#FFC107',
  WIND: '#03A9F4',
  NUCLEAR: '#9C27B0',
  NG: '#212121',
};

// Scenario outcome semantic CSS classes for indicating "goodness" of outcome.
export const SCENARIO_GOAL_CSS = {
  GOOD: 'scenario-goal-chart-region-good-outcome',
  OK: 'scenario-goal-chart-region-ok-outcome',
  BAD: 'scenario-goal-chart-region-bad-outcome',
};

// The CSS class added to scenario goal threshold lines.
export const SCENARIO_GOAL_THRESHOLD_CSS = 'scenario-goal-chart-threshold';

// Goal chart container element size dimensions.
export const SCENARIO_GOAL_CHART_SIZE = {
  width: 165,
  height: 250,
};
