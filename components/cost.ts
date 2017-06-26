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

/// <reference path="../typings/index.d.ts"/>

import * as formatters from '../formatters';
import * as transforms from '../transforms';
import * as util from '../util';
import {TextView} from './text-view';


/**
 * A page component that renders the current scenario outcome's absolute cost.
 */
export class TotalCost implements SummaryDataComponent<string> {
  _textView: TextView;

  /**
   * Constructor.
   *
   * @param element The container element.
   */
  constructor(container: HTMLElement) {
    this._textView = new TextView(container, formatters.currencyFormatter);
  }

  /**
   * Updates the component to render the new data view.
   *
   * @param view The new data view to render.
   */
  update(view: SummaryDataView<string>) {
    this._textView.update(transforms.totalCost(view));
  }
}

/**
 * A page component that renders the current scenario outcome's relative delta.
 */
export class BaselineDeltaCost   implements SummaryDataComponent<string> {
  _textView: TextView;

  /**
   * Constructor.
   *
   * @param element The container element.
   */
  constructor(container: HTMLElement) {
    this._textView = new TextView(container, formatters.currencyFormatter);
  }

  /**
   * Updates the component to render the new data view.
   *
   * @param view The new data view to render.
   */
  update(view: SummaryDataView<string>) {
    this._textView.update(transforms.baselineDeltaCost(view));
  }
}

/**
 * A page component that renders the current scenario outcome's relative delta.
 */
export class BaselineCost implements SummaryDataComponent<string> {
  _textView: TextView;

  /**
   * Constructor.
   *
   * @param element The container element.
   */
  constructor(container: HTMLElement) {
    this._textView = new TextView(container, formatters.currencyFormatter);
  }

  /**
   * Updates the component to render the new data view.
   *
   * @param view The new data view to render.
   */
  update(view: SummaryDataView<string>) {
    this._textView.update(transforms.baselineCost(view));
  }
}

/**
 * Renders the percent of total energy consumed from an energy source.
 */
export class ResourceEnergyPercent implements SummaryDataComponent<string> {
  _resourceName: string;
  _allResourceNames: string[];
  _textView: TextView;

  constructor(
      container: HTMLElement,
      resourceName: string,
      allResourceNames: string[]) {
    this._resourceName = resourceName;
    this._textView = new TextView(container, formatters.percentFormatterNoSign);
  }

  update(view: SummaryDataView<string>) {
    const totalGeneration = util.sum(this._allResourceNames.map(
        s => view.summary.breakdown[s].energy));
    const fractionGenerated = view.summary.breakdown[this._resourceName].energy
        / totalGeneration;
    this._textView.update(fractionGenerated);
  }
}

/**
 * Renders the percent of total cost contributed by the given resource.
 */
export class ResourceCostPercent implements PolicyDataComponent {
  _textView: TextView;
  _resourceName: PolicyBreakdownEntry;

  constructor(
      container: HTMLElement,
      resourceName: PolicyBreakdownEntry,
      allResourceNames: string[]) { // FIXME: drop this arg.. not required now
    this._resourceName = resourceName;

    this._textView = new TextView(container, formatters.percentFormatterNoSign);
  }

  update(view: PolicyDataView) {
    this._textView.update(transforms.costFraction(view, this._resourceName));
  }
}
