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

// The default state of the dataset selection and page controls.
export const DEFAULT_SCENARIO_SPEC: ScenarioSpec = {
  solar: 0,
  rps: 0,
  ccs_in_rps: 0,
};

export const NAMED_SCENARIOS = {
  reference: {
    title: 'Baseline',
    cost: 104e9, // USD
    co2: 57.0e6, // tonnes
  },

  // Using RPS @70% values.
  high_renewables: {
    title: 'High Renewables',
    cost: 205e9, // USD
    co2: 19.2e6, // tonnes
  },

  // Using carbon tax @$30/ton values.
  carbon_capture: {
    title: 'Carbon Capture',
    cost: 111e9, // USD
    co2: 58.6e6, // tonnes
  },

  // Using CCS-allowed, carbon tax @$30/ton values.
  advanced_nuclear: {
    title: 'Advanced Nuclear',
    cost: 103e9, // USD
    co2: 19.5e6, // tonnes
  },
};

// TODO: not all sliders will have the same number of levels in the full
// version; instead of using this constant, derive the number of levels
// from the per-dimension scales (i.e., scale.length == numLevels).
export const NUM_SLIDER_LEVELS = 20;

export const colors = {
  // Material design lite default blue.
  PRIMARY: '#3f51b5',
  LIGHT_GRAY: '#dfdfdf',
  WHITE: '#fff',
  BLACK: '#000',
};