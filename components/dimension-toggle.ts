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

interface HTMLCheckboxElement extends HTMLElement {
  checked: boolean;
}


/**
 * A scenario dimension control that supports toggling between two states.
 */
export class DimensionToggle implements DatasetSelectionView {
  element: HTMLElement;
  displayName: string;
  dimension: string;

  title: HTMLElement;
  toggle: Toggle;

  constructor(
      element: HTMLElement,
      view: DatasetSelection,
      onChangeCallback: Function) {
    this.element = element;
    this.displayName = this.element.dataset['displayName'];
    this.dimension = this.element.dataset['dimension'];

    this._build(view, onChangeCallback);
  }

  update(view: DatasetSelection) {
    // TODO: implement toggle 'previews' in some form here.
  }

  _build(view: DatasetSelection, onChangeCallback: Function) {
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.classList.add('mdl-switch__input');

    const label = document.createElement('label');
    label.classList.add('mdl-switch');
    label.classList.add('mdl-js-switch');
    label.classList.add('mdl-js-ripple-effect');
    label.appendChild(toggle);

    this.title = document.createElement('span');
    this.title.classList.add('mdl-switch__label');
    this.title.textContent = this.displayName;
    label.appendChild(this.title);

    this.toggle = new Toggle(toggle);
    this.toggle.addChangeListener(onChangeCallback);

    mdl.components.upgradeElement(label);
    this.element.appendChild(label);
  }
}


class Toggle {
  onChangeCallbacks: Function[];
  element: HTMLCheckboxElement;

  constructor(element) {
    this.element = <HTMLCheckboxElement>element;
    this.element.onchange = this.handleChangeEvent.bind(this);
    this.onChangeCallbacks = [];
  }

  addChangeListener(callback: Function) {
    this.onChangeCallbacks.push(callback);
  }

  handleChangeEvent(event) {
    const newDimensionLevel = +event.target.checked; // value in {0, 1}
    // Signal all listeners that the control's value has changed.
    this.onChangeCallbacks.forEach(callback => {
      callback(newDimensionLevel);
    });
  }
}
