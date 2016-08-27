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
/// <reference path="../dataset.d.ts" />

import * as formatters from '../formatters';
import {TextView} from './text-view';


/**
 * A page component that renders the current scenario outcome's absolute CO2.
 */
export class ScenarioCO2 implements DatasetSelectionView {
  textView: TextView;

  constructor(element) {
    this.textView = new TextView(element, formatters.largeNumberFormatter);
  }

  update(view: DatasetSelection) {
    this.textView.update(view.scenario.co2);
  }
}

/**
 * A page component that renders the current scenario's relative CO2 delta.
 */
export class ScenarioDeltaCO2 implements DatasetSelectionView {
  textView: TextView;

  constructor(element) {
    this.textView = new TextView(element, formatters.percentDeltaFormatter);
  }

  update(view: PlaygroundState) {
    this.textView.update(view.deltaToRef.co2);
  }
}
