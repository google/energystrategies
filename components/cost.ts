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
 * A page component that renders the current scenario outcome's absolute cost.
 */
export class ScenarioCost implements SummaryDataComponent {
  _textView: TextView;

  /**
   * Constructor.
   *
   * @param element The container element.
   */
  constructor(container: HTMLElement) {
    this._textView = new TextView(
      container, formatters.householdCostFormatter);
  }

  /**
   * Updates the component to render the new data view.
   *
   * @param view The new data view to render.
   */
  update(view: SummaryDataView) {
    this._textView.update(view.summary.cost);
  }
}

/**
 * A page component that renders the current scenario outcome's relative delta.
 */
export class ScenarioDeltaCost implements SummaryDataComponent {
  _textView: TextView;

  /**
   * Constructor.
   *
   * @param element The container element.
   */
  constructor(container: HTMLElement) {
    this._textView = new TextView(container, formatters.percentDeltaFormatter);
  }

  /**
   * Updates the component to render the new data view.
   *
   * @param view The new data view to render.
   */
  update(view: SummaryDataView) {
    this._textView.update(view.deltaToRef.cost);
  }
}