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
/// <reference path="dataset.d.ts" />

import * as util from './util';


describe('Function invocation throttling', () => {
  let callback;

  beforeEach(() => {
    jasmine.clock().install();
    callback = jasmine.createSpy('callback');
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('with throttle wrapper.', () => {
    const delay = 100;
    const throttledFunc = util.throttle(callback, delay);

    // Make a single call to the throttled wrapper function and verify
    // that the callback is invoked.
    expect(callback.calls.count()).toBe(0);
    throttledFunc();
    expect(callback.calls.count()).toEqual(1);

    // Making N calls still won't invoke the callback again because
    // no time has passed yet.
    throttledFunc();
    throttledFunc();
    throttledFunc();
    throttledFunc();
    throttledFunc();
    expect(callback.calls.count()).toEqual(1);

    // Progress time, but fewer ticks than the throttle delay.
    //
    // Calling the throttled wrapper should still not invoke the callback.
    jasmine.clock().tick(50);
    throttledFunc();
    expect(callback.calls.count()).toEqual(1);

    // Progress time again, this time beyond the delay.
    //
    // We should be able to invoke the throttled function exactly once now.
    jasmine.clock().tick(50);
    throttledFunc();
    throttledFunc();
    throttledFunc();
    expect(callback.calls.count()).toEqual(2);

    // Progress time again by more than the throttle delay amount.
    //
    // We should be able to invoke the callback again now (exactly once).
    jasmine.clock().tick(200);
    throttledFunc();
    throttledFunc();
    throttledFunc();
    expect(callback.calls.count()).toEqual(3);
  });

  it('without throttle wrapper.', () => {
    // Sanity check to verify that without throttling, the function is
    // executed normally on every invocation.
    expect(callback.calls.count()).toBe(0);
    callback();
    expect(callback.calls.count()).toBe(1);
    callback();
    expect(callback.calls.count()).toBe(2);

    // Advance the simulated clock (shouldn't have any effect here).
    jasmine.clock().tick(50);
    expect(callback.calls.count()).toEqual(2);
    callback();
    expect(callback.calls.count()).toEqual(3);
  });
});