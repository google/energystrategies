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

import * as mdl from '../mdl';


/**
 * The Material Design Lite progress bar element API.
 */
interface MaterialProgressElement extends HTMLElement {
  MaterialProgress: {
    /**
     * Sets the amount of progress displayed.
     *
     * @param percent The percent progress to display; value in [0, 100].
     */
    setProgress(percent: number);
  };
}

/**
 * A component for displaying progress towards reducing CO2 emissions.
 *
 * Renders the percent CO2 emissions reduction relative to a reference.
 */
export class CO2GoalProgress implements SummaryDataComponent {
  _element: HTMLElement;
  _progressBar: MaterialProgressElement;

  /**
   * Constructor.
   *
   * @param element The container element for the progress bar.
   */
  constructor(element: HTMLElement) {
    this._element = element;

    this._build();
  }

  /**
   * Updates the progress bar to display the new data view.
   *
   * @param view The new data view to render.
   */
  update(view: SummaryDataView) {
    // Relative increase in co2 => 0% progress (default).
    let progressPercent = -100 * view.deltaToRef.co2;
    // Clip value to [0%, 100%].
    progressPercent = Math.max(progressPercent, 0);
    progressPercent = Math.min(progressPercent, 100);

    this._progressBar.MaterialProgress.setProgress(progressPercent);
  }

  _build() {
    // Create an MDL progress bar element.
    const progressBar = document.createElement('div');
    progressBar.classList.add('mdl-progress');
    progressBar.classList.add('mdl-js-progress');
    // Add MDL functionality to the element.
    mdl.components.upgradeElement(progressBar);

    this._element.appendChild(progressBar);
    this._progressBar = <any> progressBar;
  }
}