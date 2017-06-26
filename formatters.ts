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


// Generates an abbreviated string representation of large numeric values.
const _baseLargeNumberFormatter = d3.format('.3s');
export const largeNumberFormatter = (value: number) => {
  // When the value to be formatted is very nearly zero, format the value as
  // simply "0" instead of -3.68e-7, etc..
  if (Math.abs(value) < 1e-6) {
      return '0';
  }
  return _baseLargeNumberFormatter(value);
}

// Formats a currency value as a whole number (i.e., whole dollars, no cents).
export const currencyFormatter =  d3.format('$,.2f');

// Formats a fractional value to a fixed number of decimal places.
export const fractionFormatter = d3.format('.2f');

// Formats a fractional value to a stock ticker-style percent delta.
//
// e.g., +2.14 => '▲214%', which reads as an 'increase of 214 percent'.
export const percentDeltaFormatter = deltaFraction => {
    const delta = Math.floor(deltaFraction * 100);
    return (delta >= 0 ? '▲' : '▼') + Math.abs(delta) + '%';
};

// Gets the sign of the given numeric value.
function getSign(value: number) {
    return value < 0 ? '-' : '+';
}

// Formats a fractional value to a signed percentage.
//
// e.g., +2.14 => '+214%', -0.3 => '-30%'
export function percentFormatter(fraction) {
    return `${getSign(fraction)}${Math.floor(Math.abs(fraction) * 100)}%`;
}

// Formats a fractional value to a unsigned percentage.
export function percentFormatterNoSign(fraction) {
    return `${Math.floor(Math.abs(fraction) * 100)}%`;
}

// Formats a value as a fractional megawatt-hour.
export function fractionMWhFormatter(fractionMWh: number) {
  return `${fractionMWh.toFixed(2)} MWh`;
}

// The following modifies the default d3 large value formatting to use
// 'business units' instead of SI units (i.e., 'Billions' instead of 'Giga-').
//
// The code is an adapted version of the d3.formatPrefix module, for the purpose
// of overriding the `d3_formatPrefixes` constant. The original source code is
// available on GitHub here for reference:
//
// tslint:disable
// https://github.com/d3/d3/blob/74582d87d81dd7fc78070437c183080c1390de9e/src/core/formatPrefix.js
// tslint:enable
//
// TODO: look for a simpler way to override the default unit behavior without
// resorting to monkey patching d3 internals.
//
// Adapted from http://stackoverflow.com/a/27808327
//
// Change D3's SI prefix to more business friendly units
//      K = thousands
//      M = millions
//      B = billions
//      T = trillion
//      P = quadrillion
//      E = quintillion
// small decimals are handled with e-n formatting.
const d3_formatPrefixes = [
    'e-24', 'e-21', 'e-18', 'e-15', 'e-12', 'e-9', 'e-6', 'e-3', '', 'K', 'M',
    'B', 'T', 'P', 'E', 'Z', 'Y'
].map(d3_formatPrefix);

function d3_formatPrefix(d, i) {
    const k = Math.pow(10, Math.abs(8 - i) * 3);
    return {
        scale: i > 8 ?
            function(d) { return d / k; } :
            function(d) { return d * k; },
        symbol: d
    };
}

function d3_format_precision(x, p) {
    return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
}

export function configure() {
    // Override d3's formatPrefix function
    d3.formatPrefix = function(value, precision) {
        let i = 0;
        if (value) {
            if (value < 0) {
                value *= -1;
            }
            if (precision) {
                value = d3.round(value, d3_format_precision(value, precision));
            }
            i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
            i = Math.max(-24, Math.min(24, Math.floor((i - 1) / 3) * 3));
        }
        return d3_formatPrefixes[8 + i / 3];
    };
}
