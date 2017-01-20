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

/// <reference path="typings/index.d.ts" />
import * as util from './util';


interface CancelAnimationFrame {
  (handle: number): void;
}
interface RequestAnimationFrame {
  (callback: FrameRequestCallback): number;
}

export class MockAnimator {
  nextHandle: number;
  currentTime: number;
  callbacks: {[key: string]: Function};
  realRAF: RequestAnimationFrame;
  realCAF: CancelAnimationFrame;

  constructor() {
    this.currentTime = 0;
    this.nextHandle = 0;
    this.callbacks = {};
    this.realRAF = window.requestAnimationFrame;
    this.realCAF = window.cancelAnimationFrame;
  }

  install() {
    window.requestAnimationFrame = this._requestAnimationFrame.bind(this);
    window.cancelAnimationFrame = this._cancelAnimationFrame.bind(this);
  }

  uninstall() {
    window.requestAnimationFrame = this.realRAF;
    window.cancelAnimationFrame = this.realCAF;
  }

  tick() {
    this.currentTime++;

    // Invoke the callbacks in the order they were registered.
    const handles = Object.keys(this.callbacks).sort(util.sortNumericAscending);
    handles.forEach(handle => {
      this.callbacks[handle](this.currentTime);
    });

    // Clear all registered callbacks.
    this.callbacks = {};
  }

  _requestAnimationFrame(callback: FrameRequestCallback): number {
    // Registers and enqueues the callback for the next animation tick.
    this.callbacks[this.nextHandle] = callback;
    return this.nextHandle++;
  }

  _cancelAnimationFrame(handle: number) {
    // Cancels the registered callback matching the given handle.
    delete this.callbacks[handle];
  }
}

