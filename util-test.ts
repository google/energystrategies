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


describe('Deep object merge', () => {
  it('when both objects are empty', () => {
    const src = {};
    const dest = {};
    util.mergeDeep(src, dest);
    expect(dest).toEqual({});
  });

  it('when source object is empty', () => {
    const src = {};
    const dest = {a: 1, b: 2};
    util.mergeDeep(src, dest);
    expect(dest).toEqual({a: 1, b: 2});
  });

  it('when destination object is empty', () => {
    const src = {a: 1, b: 2};
    const dest = {};
    util.mergeDeep(src, dest);
    expect(dest).toEqual({a: 1, b: 2});
  });

  it('when objects have no common keys', () => {
    const src = {a: 1, b: [2, 2], c: {foo: 'bar'}};
    const dest = {d: 3, e: [4, 4], f: {foo: 'bar'}};
    util.mergeDeep(src, dest);
    // Expect the union of the source and destination objects.
    expect(dest).toEqual({
      a: 1, b: [2, 2], c: {foo: 'bar'},
      d: 3, e: [4, 4], f: {foo: 'bar'},
    });
  });

  it('when atomic source values overwrite atomic destination values', () => {
    const src = {a: 1, b: 2};
    const dest = {b: -1, c: 3};
    util.mergeDeep(src, dest);
    // Expect source values to overwrite destination values when
    // both objects define the same key (and both are primitive).
    expect(dest).toEqual({a: 1, b: 2, c: 3});
  });

  it('when atomic source values overwrite destination value objects', () => {
    const src = {a: 1, b: 2};
    const dest = {b: {foo: 'bar'}, c: 3};
    util.mergeDeep(src, dest);
    // When the same key exists in the destination object, the source
    // value overwrites when the source value is primitive (i.e.,
    // not-an-object).
    expect(dest).toEqual({a: 1, b: 2, c: 3});
  });

  it('when source values recursively merge with destination values', () => {
    const src = {
      a: {foo: 1, bar: 2},
      b: {foo: 4, bar: 5},
    };
    const dest = {
      a: {foo: -1, baz: -3},
      b: {foo: -4, baz: -6},
    };
    util.mergeDeep(src, dest);
    // The values for all "foo" and "bar" keys should match the source object,
    // while all "baz" values should match the destination object.
    expect(dest).toEqual({
      a: {foo: 1, bar: 2, baz: -3},
      b: {foo: 4, bar: 5, baz: -6},
    });
  });
});

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