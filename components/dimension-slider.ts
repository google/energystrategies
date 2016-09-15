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
import * as config from '../config';


/**
 * Dimension slider control element.
 *
 * Provides a range element for the user to modify a scenario dimension value
 * (e.g., solar cost).
 */
export class DimensionSlider implements DatasetSelectionView {
  element: HTMLElement;
  displayName: string;
  dimension: string;
  numLevels: number;

  title: HTMLElement;
  slider: OrdinalSlider;
  sliceChart: DatasetSelectionView;

  /**
   * Constructor.
   *
   * @param element The container element for the slider.
   * @param view The initial dataset selection view for the slider.
   * @param onChangeCallback A callback that will be invoked whenever the
   *     slider state changes (e.g., user moves slider to new value).
   */
  constructor(
      element: HTMLElement,
      view: DatasetSelection,
      onChangeCallback: Function) {
    this.element = element;

    // Extract component configuration from the DOM element's data-* attrs.
    //
    // Note that element properties are defined in snake-case
    // (e.g., <div data-foo-bar-baz=...>)
    // but are access within javascript code as their camelCase equivalents
    // with the leading "data-" prefix stripped (e.g.,
    // element.dataset['fooBarBaz']).
    this.displayName = this.element.dataset['displayName'];
    this.dimension = this.element.dataset['dimension'];

    // TODO: derive this setting from the dimension's scale size.
    this.numLevels = config.NUM_SLIDER_LEVELS;

    this._build(view, onChangeCallback);
    console.debug(`Created minimal DimensionSlider for ${this.displayName}`);
  }

  /**
   * Updates the slider's displayed state when the dataset selection changes.
   *
   * @param view The updated dataset selection view.
   */
  update(view: DatasetSelection) {
    // Currently a no-op.
  }

  _build(view: DatasetSelection, onChangeCallback: Function) {
    this.title = document.createElement('h5');
    this.title.textContent = this.displayName;
    this.element.appendChild(this.title);

    // Create a container element that is used for styling the slider.
    const sliderContainer = document.createElement('div');
    // sliderContainer.classList.add('dimension-slider-container');
    this.element.appendChild(sliderContainer);

    // Create the MDL slider element.
    const sliderMax = 100;
    const stepSize = Math.floor(sliderMax / this.numLevels);
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.classList.add('mdl-slider');
    slider.classList.add('mdl-js-slider');
    slider.min = '0';
    slider.max = String(Math.floor(sliderMax - stepSize));
    slider.value = '0';
    slider.step = String(stepSize);

    sliderContainer.appendChild(slider);
    mdl.components.upgradeElement(slider);
    this.element.appendChild(sliderContainer);

    // Configure the interaction behavior of the slider.
    this.slider = new OrdinalSlider(slider, this.numLevels);
    this.slider.addChangeListener(onChangeCallback);
  }
}

/**
 * A slider defined to have a fixed number of ordinal levels.
 */
class OrdinalSlider {
  element: HTMLElement;
  numLevels: number;
  onChangeCallbacks: Function[];

  /**
   * Constructor.
   *
   * @param element The container element for the slider.
   * @param numLevels The number of steps/notches/levels for the slider.
   */
  constructor(element: HTMLElement, numLevels: number) {
    this.element = element;
    this.numLevels = numLevels;
    this.onChangeCallbacks = [];

    this.element.onchange = this.handleChangeEvent.bind(this);
  }

  addChangeListener(callback) {
    this.onChangeCallbacks.push(callback);
  }

  handleChangeEvent(event) {
    const newDimensionLevel = this._sliderValueToLevel(event.target.value);
    // Signal all listeres that the control's value has changed.
    this.onChangeCallbacks.forEach(callback => {
      callback(newDimensionLevel);
    });
  }

  _sliderValueToLevel(sliderValue) {
    // Convert from [0, 95] in "step"-sized increments (step=5)
    // to a value in [0, 19] corresponding to the intended config "level"
    // ordinal
    const sliderMax = 100;
    return Math.floor(sliderValue / (sliderMax / this.numLevels));
  }
}
