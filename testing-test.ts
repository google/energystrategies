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


import * as testing from './testing';


describe('MockAnimator', () => {
  it('install/uninstall lifecycle', () => {
    const raf = window.requestAnimationFrame;
    const caf = window.cancelAnimationFrame;

    const mock = new testing.MockAnimator();
    mock.install();

    // Verify that the built-in animation functions are removed.
    expect(raf).not.toBe(window.requestAnimationFrame);
    expect(caf).not.toBe(window.cancelAnimationFrame);

    let invokeSequence = [];
    let called = false;
    function callback() {
      called = true;
      invokeSequence.push('cb1');
    }
    let called2 = false;
    function callback2() {
      called2 = true;
      invokeSequence.push('cb2');
    }
    let called3 = false;
    function callback3() {
      called3 = true;
      invokeSequence.push('cb3');
    }

    // Registering the callback shouldn't invoke the callback.
    const handle = window.requestAnimationFrame(callback);
    expect(handle).toBe(0);
    const handle2 = window.requestAnimationFrame(callback2);
    expect(handle2).toBe(1);
    const handle3 = window.requestAnimationFrame(callback3);
    expect(handle3).toBe(2);

    expect(called).toBe(false);
    expect(called2).toBe(false);
    expect(called3).toBe(false);

    // Callback2 shouldn't be invoked if cancelled.
    window.cancelAnimationFrame(handle2);

    // Jump to the next animation frame tick and check that non-cancelled
    // callbacks were invoked.
    mock.tick();
    expect(called).toBe(true);
    expect(called2).toBe(false);
    expect(called3).toBe(true);

    // The callbacks should have been invoked in the order they were registered.
    expect(invokeSequence).toEqual(['cb1', 'cb3']);

    mock.uninstall();

    // Verify that the uninstall call actually reinstalled the window built-ins.
    expect(raf).toBe(window.requestAnimationFrame);
    expect(caf).toBe(window.cancelAnimationFrame);
  });
});