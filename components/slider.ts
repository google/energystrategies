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


import * as mdl from '../mdl';
import * as util from '../util';


/**
 * The Material Design Lite slider element API.
 */
interface MaterialSliderElement extends HTMLInputElement {
  MaterialSlider: {
    /**
     * Sets the current value of the slider to the given value.
     *
     * @param value The new value for the slider.
     */
    change(value: number)
  };
}

/**
 * Event produced by range input elements.
 */
interface RangeInputChangeEvent {
  // The event target is a reference to the range element that was modified.
  target: {
    // The new/updated value of the range element as a string.
    value: string;
  };
}

/**
 * Callback interface for slider change event listeners.
 */
interface SliderOnChangeCallback {
  /**
   * Callback handler for slider change events.
   *
   * @param newValue The new value of the slider; the value return is a number
   *     in the interval [sliderMin, sliderMax].
   */
  (newValue: number): void;
}

/**
 * A slider control for selecting a value from a predefined range.
 */
export class Slider {
  _container: HTMLElement;
  _range: MaterialSliderElement;
  _onChangeCallbacks: SliderOnChangeCallback[];

  /**
   * Constructor.
   *
   * @param container The container element for the slider.
   * @param min The minimum value for the slider.
   * @param max The maximum value for the slider.
   * @param step The step size between stops on the slider.
   * @param initialValue The initial value for the slider.
   */
  constructor(
      container: HTMLElement,
      min: number,
      max: number,
      step: number,
      initialValue: number) {
    this._container = container;
    this._range = null;
    this._onChangeCallbacks = [];

    this._build(min, max, step, initialValue);
  }

  /**
   * Registers a callback that will be called when the slider value changes.
   *
   * @param callback The callback function to invoke when the slider is
   *     updated.
   */
  addChangeListener(callback: SliderOnChangeCallback) {
    this._onChangeCallbacks.push(callback);
  }

  /**
   * Sets the current value (position) of the slider.
   *
   * @param value The new value for the slider.
   */
  setValue(value: number) {
    this._range.MaterialSlider.change(value);
  }

  /**
   * Creates the slider element within the container and wires event callbacks.
   *
   * @param min The minimum value for the slider.
   * @param max The maximum value for the slider.
   * @param step The step size between stops on the slider.
   * @param initialValue The initial value for the slider.
   */
  _build(min, max, step, initialValue) {
    // Create the MDL slider element.
    const range = document.createElement('input');
    range.type = 'range';
    range.classList.add('mdl-slider');
    range.classList.add('mdl-js-slider');
    range.min = String(min);
    range.max = String(max);
    if (step) {
      range.step = String(step);
    }
    range.value = String(initialValue);

    this._container.appendChild(range);
    mdl.components.upgradeElement(range);

    // Register a callback to handle the underlying range element change
    // events that fire when the slider is moved (and while moving).
    const throttledChangeHandler = util.throttle(
      this._handleChangeEvent.bind(this), 50);
    // Use the same throttled entry point for both input and change
    // event callbacks. Either range input event (change or input) will
    // trigger the throttle and cause the state of the slider to update
    // Details of change event triggers vary by browser maker/version.
    //
    // Both change and input events are being captured to allow for slider
    // value updates while the slider is being dragged; having only the
    // change event results in no updates while the slider is moving (only
    // when it's "dropped").
    range.onchange = throttledChangeHandler;
    range.oninput = throttledChangeHandler;

    this._range = <any> range;
  }

  _handleChangeEvent(event: RangeInputChangeEvent) {
    // Extract the current value of the slider from the change event.
    const newValue = parseFloat(event.target.value);
    // Notify all listeners that the slider's state has changed.
    this._onChangeCallbacks.forEach(callback => {
      callback(newValue);
    });
  }
}
