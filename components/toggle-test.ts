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

import * as mdl from '../mdl';
import {OptionToggle} from './toggle';


describe('Toggle element', () => {
  let checkbox: HTMLInputElement;
  let container: HTMLElement;
  let label: HTMLElement;
  let view: SummaryDataView<EnergySource>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    // Create an MDL checkbox with all associated interactive upgrades to verify
    // that the toggle also works for a "rich" MDL checkbox.
    container.innerHTML = `\
        <label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect"
              for="the-checkbox">
          <input type="checkbox" id="the-checkbox" class="mdl-checkbox__input">
        </label>`
    checkbox = <HTMLInputElement>document.getElementById('the-checkbox');
    label = <HTMLElement>container.children[0];
    mdl.components.upgradeElement(label);
  });

  afterEach(() => {
    // Destroy the sandbox and its contents.
    container.remove();
  });

  it('can be disabled/enabled programmatically.', () => {
    const toggle = new OptionToggle(checkbox);

    // Verify that the underlying checkbox element is being disabled
    // when the toggle control is disabled.
    expect(checkbox.disabled).toBe(false);
    toggle.disable();
    expect(checkbox.disabled).toBe(true);
    toggle.enable();
    expect(checkbox.disabled).toBe(false);
  });

  it('rejects a vanilla checkbox.', () => {
    // The toggle expects a MDL checkbox which has additional properties
    // and methods attached for programmatic control, so verify that
    // a vanilla checkbox is rejected.
    container.remove();
    container = document.createElement('div');
    document.body.appendChild(container);
    checkbox = document.createElement('input');
    checkbox.type = 'checkbox';

    expect(() => new OptionToggle(checkbox)).toThrowError();
  });

  it('calls change listeners when state is changed', () => {
    const toggle = new OptionToggle(checkbox);

    let observedValue = null;
    toggle.addChangeListener(newValue => {
      observedValue = newValue;
    });

    // Since the checkbox is currently unchecked (state == false), then setting
    // the toggle's state to true should modify the state and invoke change
    // listener callbacks with the updated state.
    expect(checkbox.checked).toBeFalsy();
    toggle.setValue(true);
    expect(toggle.getValue()).toBe(true);
    expect(checkbox.checked).toBeTruthy();
    expect(observedValue).toBeTruthy();
  });

  it('does not call change listeners when state is unchanged', () => {
    const toggle = new OptionToggle(checkbox);

    let observedValue = null;
    toggle.addChangeListener(newValue => {
      observedValue = newValue;
    });

    // Since the checkbox is currently unchecked (state == false), then setting
    // the toggle's state to false should have no side-effects, and should
    // not invoke change listeners.
    expect(checkbox.checked).toBeFalsy();
    toggle.setValue(false);
    expect(toggle.getValue()).toBe(false);
    expect(checkbox.checked).toBeFalsy();
    expect(observedValue).toBeNull();
  });

  it('calls all change listeners when state changes', () => {
    const toggle = new OptionToggle(checkbox);

    // Add more than 1 listener to verify everyone gets a callback.
    const observedValues = [null, null];
    const callbacks = [
      newValue => observedValues[0] = newValue,
      newValue => observedValues[1] = newValue,
    ];
    toggle.addChangeListener(callbacks[0]);
    toggle.addChangeListener(callbacks[1]);

    // Since the checkbox is currently unchecked (state == false), then setting
    // the toggle's state to false should have no side-effects, and should
    // not invoke change listeners.
    expect(checkbox.checked).toBeFalsy();
    toggle.setValue(true);
    expect(toggle.getValue()).toBe(true);
    expect(checkbox.checked).toBe(true);
    observedValues.forEach((observedValue, index) => {
      // Each of the (initially null) observed values should have been
      // overwritten if the corresponding callback was invoked.
      expect(observedValue).toEqual(true);
    });
  });
});