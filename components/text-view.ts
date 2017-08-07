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
 * An element with formatted, text-based content that can update dynamically.
 */
export class TextView {
  element: HTMLElement;
  formatter: Function;

  constructor(element, formatter?: Function) {
    this.element = element;
    this.formatter = formatter || (value => String(value));
  }

  update(newValue) {
    this.element.textContent = this.formatter(newValue);
  }
}


export class InputTextView {
  element: HTMLInputElement;
  formatter: Function;

  constructor(element: HTMLInputElement, formatter?: Function) {
    this.element = element;
    this.formatter = formatter || (value => String(value));
  }

  update(newValue) {
    const MAX_LENGTH = 1000;
    this.element.value = this.formatter(newValue);
    this.element.selectionDirection = 'forward';
    this.element.selectionStart = 0;
    this.element.selectionEnd = MAX_LENGTH;
    this.element.maxLength = MAX_LENGTH;

    this.element.width = String(300);
  }
}