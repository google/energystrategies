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


type OnPresetSelectCallback<K> = {(presetKey: K)};

/**
 * A group of mutually exclusive options.
 *
 * Effectively, an MDL-based radio group built from MDL toggle elements.
 *
 * @param PresetKey A type that may constrain the set of valid key strings.
 *   For example, given `type foo='bar'|'baz'`, then the set of allowed
 *   preset key strings will be limited to just 'bar' and 'baz'.
 */
export class PresetOptionGroup<PresetKey extends string> {

  _presetOptions: {[s: string]: PresetOption};
  _onChangeCallback: OnPresetSelectCallback<PresetKey>;

  /**
   * Constructor.
   *
   * @param presetKeyToElement A mapping from preset key (e.g., 'SOME_NAME') to
   *   a checkbox DOM element (e.g., native checkbox or MDL-stylized checkbox).
   * @param onChangeCallback A callback to invoke whenever a preset is selected;
   *   the callback is passed the key for the preset that was selected.
   */
  constructor(
      presetKeyToElement: {[s: string]: HTMLElement},
      onChangeCallback: OnPresetSelectCallback<PresetKey>) {

    this._onChangeCallback = onChangeCallback;
    this._presetOptions = this._createPresetGroup(presetKeyToElement);
  }

  /**
   * Selects the specified preset option.
   *
   * Because presets are mutually exclusive, all other members of the preset
   * group are deselected as a side-effect.
   *
   * @param presetKey The key for the preset to select.
   */
  select(presetKey: PresetKey) {
    this._onChangeCallback(presetKey);

    // Ensure only the selected preset is "checked".
    this.deselectAll();
    this._presetOptions[presetKey].select();
  }

  /**
   * Deselects all of the preset options.
   */
  deselectAll() {
    Object.keys(this._presetOptions).forEach(name => {
      this._presetOptions[name].deselect();
    });
  }

  /**
   * Creates a linked set of preset option elements.
   *
   * @param presetKeyToElement A mapping from preset key to checkbox DOM
   *   element.
   * @returns A mapping from preset key to PresetOption instance.
   */
  _createPresetGroup(presetKeyToElement: {[s: string]: HTMLElement}) {
    const nameToPreset: {[s: string]: PresetOption} = {};
    Object.keys(presetKeyToElement).forEach(name => {
      nameToPreset[name] = new PresetOption(
          presetKeyToElement[name],
          (event: Event) => this.select(<PresetKey>name));
    });
    return nameToPreset;
  }
}

/**
 * A single MDL checkbox.
 */
export class PresetOption {
  _checkboxElement;
  _onPresetSelectCallback;
  _mdlToggle;

  constructor(checkboxElement: HTMLElement, onPresetSelectCallback: Function) {
    this._checkboxElement = checkboxElement;
    this._onPresetSelectCallback = onPresetSelectCallback;

    this._build();
  }

  /**
   * Selects the given preset element; i.e., "checked" if this were a checkbox.
   */
  select() {
    this._mdlToggle.check();
  }

  /**
   * Deselects the element; i.e., "unchecked" visually if this were a checkbox.
   */
  deselect() {
    this._mdlToggle.uncheck();
  }

  _build() {
    // mdl wraps the checkbox in a <label> element and adds helpers
    const materialToggleElement = this._checkboxElement.parentElement;
    const mdlToggle = (<any>materialToggleElement).MaterialIconToggle;

    this._mdlToggle = mdlToggle;
    materialToggleElement.onclick = (event: Event) => {
      // Always highlight the button when clicked
      // i.e., don't toggle if reclicked while enabled
      mdlToggle.check();

      this._onPresetSelectCallback();
    };
  }

  // TODO: can make this support the
}
