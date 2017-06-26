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


import * as util from './util';
import * as testing from './testing';


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

describe('Numeric ascending sort comparator', () => {
  it('sorts numbers ascending', () => {
    const arr = [5, 4, 3, 2, 1];
    arr.sort(util.sortNumericAscending);
    expect(arr).toEqual([1, 2, 3, 4, 5]);
  });
  it('sorts stringified numbers ascending', () => {
    const arr = ['5', '4', '3', '2', '1'];
    arr.sort(util.sortNumericAscending);
    expect(arr).toEqual(['1', '2', '3', '4', '5']);
  });
});

describe('Animation frame-based render throttling', () => {
  let mockAnimator;

  beforeEach(() => {
    mockAnimator = new testing.MockAnimator();
    mockAnimator.install();
  });

  afterEach(() => {
    mockAnimator.uninstall();
  });

  it('animates a pair of update and render callbacks', () => {
    // The state being tracked.
    let value = 0;

    let numUpdates = 0;
    function update(newValue) {
      value = newValue;
      numUpdates++;
    }

    let renderedValues = [];
    let numRenders = 0;
    function render() {
      renderedValues.push(value);
      numRenders++;
    }

    const animatedUpdate: Function = util.animate(update, render);

    // All calls to the wrapped update function should immediately modify the
    // state stored in the `value` variable.
    animatedUpdate(3);
    expect(value).toBe(3);
    expect(numUpdates).toBe(1);

    animatedUpdate(5);
    expect(value).toBe(5);
    expect(numUpdates).toBe(2);

    // An animation frame has not yet passed, so the previous updates should
    // not have forced a render invocation.
    expect(numRenders).toBe(0);

    // Move to the next animation frame and verify that the latest state of
    // `value` was flushed via the render callback.
    mockAnimator.tick();
    expect(numRenders).toBe(1);
    expect(renderedValues).toEqual([5]);

    // No updates were made since the last animation frame tick, so we don't
    // expect the render callback to be invoked again, even if another
    // animation frame occurs.
    mockAnimator.tick();
    expect(numRenders).toBe(1);
    expect(numUpdates).toBe(2);
    mockAnimator.tick();
    expect(numRenders).toBe(1);
    expect(numUpdates).toBe(2);

    // Calling the wrapped update should re-start the async rendering process
    // and only the final update (up until the next tick) should be rendered.
    animatedUpdate(7);
    animatedUpdate(9);
    expect(value).toBe(9);
    expect(numUpdates).toBe(4);

    // The number of render calls should match the number of throttled changes,
    // such that render isn't being called on requestAnimationFrame ticks where
    // no modifications occured.
    //
    // We would expect rendered values to be [5,5,5,9] if render was being
    // called on every frame.
    mockAnimator.tick();
    expect(renderedValues).toEqual([5, 9]);
  });

  it('animates update and render callbacks bound to an object context', () => {
    // Define a trivial object that has both an update and render method.
    //
    // The purpose of this test is to verify that bound object methods
    // will retain the object instance context when invoked by the animated
    // wrapper function; i.e., verify that the implementation of animate()
    // does not clobber the `this` context being bound externally.
    class Renderer {
      value: number;
      numRenders: number;
      numUpdates: number;
      renderedValues: number[];

      constructor() {
        this.value = 0;
        this.numRenders = 0;
        this.numUpdates = 0;
        this.renderedValues = [];
      }

      update(newValue: number) {
        this.numUpdates += 1;
        this.value = newValue;
      }

      render() {
        this.numRenders += 1;
        this.renderedValues.push(this.value);
      }
    }

    const foo = new Renderer();
    const animatedUpdate: Function = util.animate(
      foo.update.bind(foo),
      foo.render.bind(foo));

    mockAnimator.tick();
    animatedUpdate(3);
    animatedUpdate(5);
    mockAnimator.tick();
    animatedUpdate(7);
    animatedUpdate(9);
    mockAnimator.tick();

    expect(foo.numRenders).toBe(2);
    expect(foo.numUpdates).toBe(4);
    expect(foo.renderedValues).toEqual([5, 9]);
    expect(foo.value).toBe(9);
  });
});

describe('Base64 encoding and decoding of js objects', () => {
  it('decodes a simple object', () => {
    const encoded = 'eyJmb28iOiJmb28iLCJiYXIiOiJiYXIifQ==';
    expect(util.base64Decode(encoded)).toEqual({
      foo: 'foo',
      bar: 'bar'
    });
  });

  it('decodes an empty object', () => {
    const encoded = 'e30=';
    expect(util.base64Decode(encoded)).toEqual({});
  });

  it('round-trip encodes an empty object', () => {
    const orig = {};
    const encoded = util.base64Encode(orig);
    expect(util.base64Decode(encoded)).toEqual(orig);
  });

  it('round-trip encodes a non-empty object', () => {
    const orig = {
      foo: 'foo',
      bar: 'bar',
      list: [1, 2, 3],
      nested: {
        baz: 'baz'
      }
    };
    const encoded = util.base64Encode(orig);
    expect(util.base64Decode(encoded)).toEqual(orig);
  });
});