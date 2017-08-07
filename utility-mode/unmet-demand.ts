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

import * as util from '../util';


export const CSS_UNMET_DEMAND_CLASS = 'unmet';

export class UnmetEnergyDemand implements UtilityDataComponent {
  _contextElements: HTMLElement[];

  constructor(contextElements: HTMLElement[]) {
    this._contextElements = contextElements;
  }

  update(view: UtilityDataView) {
    // Check for unmet demand and enable context-dependent elements.
    const unmetSeries = view.profiles.series.unmet;
    const totalUnmetDemand = util.sum(unmetSeries);
    if (totalUnmetDemand > 0) {
      this._contextElements.forEach(el => {
        el.classList.add(CSS_UNMET_DEMAND_CLASS);
      });
    } else {
      this._contextElements.forEach(el => {
        el.classList.remove(CSS_UNMET_DEMAND_CLASS);
      });
    }
  }
}
