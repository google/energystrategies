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
/// <reference path="es6.d.ts" />


// Declare that we expect ES6 Object features to be available.
declare const Object: ObjectConstructorES6;


export const shallowCopy = (source: Object, dest: Object) => {
    return Object.assign(dest, source);
};

export const deltas = (baseline: ScenarioOutcome, current: ScenarioOutcome) => {
    function delta(ref, value) {
        return (value - ref) / ref;
    }

    return {
        co2: delta(baseline.co2, current.co2),
        cost: delta(baseline.cost, current.cost),
    };
};

// TODO: need to "show the work" on this formulation somewhere.
const MONTHLY_COST_PER_HOUSEHOLD_DIVISOR = 2.083e9;
export const asMonthlyPerHouseholdCost = (totalCost: number) => {
    return totalCost / MONTHLY_COST_PER_HOUSEHOLD_DIVISOR;
};

/**
 * Gets the sum of the series of numeric values.
 *
 * @param series An array of numbers.
 * @return The sum of the array.
 */
export function sum(series: number[]) {
  let total = 0;
  series.forEach(x => total += x);
  return total;
}

/**
 * Gets the maximum value within the series of numerica values.
 *
 * @param series An array of numbers.
 * @return The maxiumum value within the series or -Infinity for zero-length
 *     series.
 */
export function max(series: number[]) {
  let maxSoFar = -Infinity;
  series.forEach(x => maxSoFar = Math.max(maxSoFar, x));
  return maxSoFar;
}

/**
 * Selects elements in the DOM matching the given query selector.
 *
 * @param querySelector A DOM query selector string.
 * @return The array of elements that matched the query selector.
 */
export function selectElements(querySelector: string): HTMLElement[] {
    let nodeList = document.querySelectorAll(querySelector);
    return Array.prototype.slice.call(nodeList);
}

/**
 * Throttles the invocation rate of the given function.
 *
 * @param fn The function to throttle.
 * @param delay The delay (millis) enforced between allowed invocations of the
 *     function.
 * @returns A wrapped version of the input function with throttled invocation.
 */
export function throttle(fn: Function, delay: number) {
  let timer = null;
  return function () {
    if (!timer) {
      // Invoke the throttled function immediately (no active timer).
      fn.apply(this, arguments);

      // Block re-execution until the timer expires.
      timer = setTimeout(() => {
        timer = null;
      }, delay);
    }
  };
}


/**
 * Recursively merges the keys of two objects.
 *
 * If the same key is found within the source and destination objects, then
 * the source value overwrites the destination value (in the case of atomic
 * values like strings or numbers) or continues to merge with the destination
 * value if the destination and source values are both objects.
 *
 * @param source The source object (keys copied from here); the source object
 *     is unmodified by the merge process.
 * @param destination The destination object (keys copied to here); the
 *     destination object is mutated by the merge process.
 */
export function mergeDeep(source, destination) {
  Object.keys(source).forEach(k => {
    // Object values need to be recursively merged if the corresponding
    // key also exists in the destination object.
    if (source[k] && typeof source[k] == 'object'
        && destination[k] && typeof destination[k] == 'object') {
      mergeDeep(source[k], destination[k]);
    } else {
      // Non-object values can be copied over as-is.
      destination[k] = source[k];
    }
  });
}

/**
 * Pairwise element comparator for ascending numeric sort.
 *
 * For example: someArray.sort(sortNumericAscending)
 *
 * @param a The first element in the pair.
 * @param b The second element in the pair.
 * @returns A negative value if `a` should precede `b`; else some value >= 0.
 */
export function sortNumericAscending(a, b): number {
  return parseInt(a) - parseInt(b);
}

/**
 * Creates an update function that invokes a rate-limited render function.
 *
 * Separating model state updates from view render calls provides a means of
 * coalescing high-frequency updates into fewer (expensive) render calls while
 * maintaining up-to-date state in the data model.
 *
 * A typical use case is preventing high-frequency on-change callbacks from
 * overwhelming the browser with 1:1 update:render invocations.
 *
 * For example:
 * function myOnChangeCallback(...)
 * function myRenderCallback(...)
 * someDomNode.onchange = animate(myOnChangeCallback, myRenderCallback)
 *
 * Now when the onChange event is fired for the domNode, the update callback
 * is immediately invoked, while the render callback is deferred until the
 * next browser animation frame is available (via window.requestAnimationFrame).
 *
 * @param update The update callback to be invoked on every state change.
 * @param render The render callback to invoke for view repaints.
 * @returns A wrapped update function that will trigger rate-limited
 *   rendering as necessary.
 */
export function animate(update, render) {
  // Continue animating until the latest update has been rendered.
  let isAnimating = false;

  // Wrap the user-provided render callback so that animation stops after
  // the latest update() invocation has been rendered.
  function wrappedRender() {
    render.apply(null, arguments);
    isAnimating = false;
  }

  // Wrap the user-provided update callback so that a render invocation is
  // automatically requested if necessary.
  function wrappedUpdate() {
    // Invoke update() so that the latest state is saved for subsequent
    // render invocations.
    update.apply(null, arguments);

    // Only request a render call if one is not already in flight.
    if (!isAnimating) {
      window.requestAnimationFrame(wrappedRender);
    }
    isAnimating = true;
  }

  return wrappedUpdate;
}