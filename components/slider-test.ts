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
import {Slider} from './slider';


describe('Slider element', () => {
  let container: HTMLElement;
  let view: SummaryDataView<EnergySource>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Destroy the sandbox and its contents.
    container.remove();
  });

  it('supports enable/disable actions.', () => {
    const values = ['0', '1', '2', '3', '4', '5'];
    const slider = new Slider(container, 0, 5, 1, 3, values);
    const range = <HTMLInputElement>container.querySelector('input[type=range]');
    expect(range.disabled).toBe(false);
    slider.disable();
    expect(range.disabled).toBe(true);
    slider.enable();
    expect(range.disabled).toBe(false);
  });

  it('notifies listeners when state is changed.', () => {
    const values = ['0', '1', '2', '3', '4', '5'];
    const slider = new Slider(container, 0, 5, 1, 3, values);
    const sliderStates = [null];
    slider.addChangeListener(newValue => sliderStates.push(newValue));
    slider.setValue(0);
    expect(sliderStates).toEqual([null, 0]);
    slider.setValue(3);
    expect(sliderStates).toEqual([null, 0, 3]);
    slider.setValue(0);
    expect(sliderStates).toEqual([null, 0, 3, 0]);
  });

  it('notifies multiple listeners when state is changed.', () => {
    const values = ['0', '1', '2', '3', '4', '5'];
    const slider = new Slider(container, 0, 5, 1, 3, values);
    const sliderStates = {foo: [null], bar: [null]};

    slider.addChangeListener(newValue => sliderStates.foo.push(newValue));
    slider.addChangeListener(newValue => sliderStates.bar.push(newValue));
    slider.setValue(3);
    expect(sliderStates).toEqual({foo: [null, 3], bar: [null, 3]});
  });

  it('detects invalid configuration', () => {
    const values = ['0', '1', '2'];
    // Mismatch in number of slider stops and number of display values.
    expect(() => new Slider(container, 0, 5, 1, 3, values)).toThrowError();
  });
});