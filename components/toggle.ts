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


/**
 * Callback interface for modal option change event listeners.
 */
interface ToggleOnChangeCallback {
  /**
   * Callback handler for option toggle change events.
   *
   * @param newValue The new state of the toggle as a boolean.
   */
  (newValue: boolean): void;
}

interface MaterialCheckbox {
  /**
   * Disables the checkbox.
   */
  disable();

  /**
   * Enables the checkbox.
   */
  enable();
}

/**
 * A component that presents a binary option.
 */
export class OptionToggle {
  _checkbox: HTMLInputElement;
  _onChangeCallbacks: ToggleOnChangeCallback[];
  _materialCheckbox: MaterialCheckbox;

  /**
   * Constructor.
   *
   */
  constructor(checkbox: HTMLInputElement) {
    this._checkbox = checkbox;
    this._onChangeCallbacks = [];

    // Listen for change events on the underlying DOM checkbox element.
    this._checkbox.onchange = this._handleChangeEvent.bind(this);
    const materialWrapper: any = this._checkbox.parentElement;
    if (!materialWrapper || !materialWrapper.MaterialCheckbox) {
      throw new Error(
        `Cannot create toggle control from checkbox element ${checkbox.id}`
        + `because checkbox has not been upgraded to a MDL checkbox.`);
    }
    this._materialCheckbox = <MaterialCheckbox>materialWrapper.MaterialCheckbox;
  }

  /**
   * Registers a callback that will be called when the slider value changes.
   *
   * @param callback The callback function to invoke when the slider is
   *     updated.
   */
  addChangeListener(callback: ToggleOnChangeCallback) {
    this._onChangeCallbacks.push(callback);
  }

  /**
   * Gets the current value of the option toggle component.
   *
   * @returns A boolean to indicate if the toggle is "enabled"/"on".
   */
  getValue(): boolean {
    return this._checkbox.checked;
  }

  /**
   * Enables the toggle element.
   */
  enable() {
    this._materialCheckbox.enable();
  }

  /**
   * Disables the toggle element.
   */
  disable() {
    this._materialCheckbox.disable();
  }

  /**
   * Sets the current value for the toggle component: on or off.
   *
   * @param isEnabled A boolean to indicate if the toggle should be "on".
   */
  setValue(isEnabled: boolean) {
    // Toggle the checkbox state if the desired value is different than the
    // current value.
    if (this._checkbox.checked !== isEnabled) {
      this._checkbox.click();
    }
  }

  _handleChangeEvent(event: EventWithValue) {
    // Notify all listeners that the toggle's state has changed.
    this._onChangeCallbacks.forEach(callback => {
      callback(this.getValue());
    });
  }
}

interface EventWithValue {
  target: {
    value: string;
  };
}
