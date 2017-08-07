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

import {TotalCost} from '../components/cost';
import {CompsTable} from '../components/comps-table';
import * as libpreset from '../components/presets';
import {InputTextView} from '../components/text-view';
import * as share from './share';
import * as config from './config';
import {PRESET_POLICY_DISPLAY_NAMES} from '../policy-mode/config';


/**
 * Controller for compare mode.
 */
export class CompareController {

  _view: CompareDataView;

  _components: CompareDataComponent[];

  _shareLink: InputTextView;

  /**
   * Initializes the compare mode controller.
   *
   * @param comps The set of policy outcomes being compared.
   * @param selection The current user-selected policy outcome.
   */
  init(comps: {[index: string]: PolicyDataView}, selection: PolicyDataView) {
    this._view = {
      selection: selection,
      comps: comps,
    };

    this._shareLink = new InputTextView(
        <HTMLInputElement>document.getElementById('share-link'));

    const compKeys = Object.keys(this._view.comps);
    compKeys.sort();

    this._components = [
      new CompsTable(
        document.getElementById('compare-mode-summary-table'),
        this._view, compKeys, config.SUMMARY_FIELDS, PRESET_POLICY_DISPLAY_NAMES,
        config.SUMMARY_TITLE),
      new CompsTable(
        document.getElementById('compare-mode-policy-table'),
        this._view, compKeys, config.POLICY_FIELDS, PRESET_POLICY_DISPLAY_NAMES,
        config.POLICY_TITLE),
      new CompsTable(
        document.getElementById('compare-mode-cost-table'),
        this._view, compKeys, config.COST_FIELDS, PRESET_POLICY_DISPLAY_NAMES,
        config.COST_TITLE),
      new CompsTable(
        document.getElementById('compare-mode-energy-table'),
        this._view, compKeys, config.ENERGY_FIELDS, PRESET_POLICY_DISPLAY_NAMES,
        config.ENERGY_TITLE),
    ];
  }

  /**
   * Replaces the user policy being compared.
   */
  update(newSelectedPolicy: PolicyDataView) {
    this._view.selection = newSelectedPolicy;
    this._components.forEach(c => c.update(this._view));
    this._shareLink.update(window.location.href);
  }
}
