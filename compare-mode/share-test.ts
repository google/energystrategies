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

import * as share from './share';


describe('App state', () => {
  let policy: PolicyConfig;
  let schema: PolicyDatasetSchema;
  let fakeHistory: History;
  let currentUrl: string;
  let fakeLocation: Location;

  beforeEach(() => {
    policy = {
      solar_price: 0,
      wind_price: 2,
      nuclear_price: 0,
      ng_price: 0,
      carbon_tax: 11,
      rps: 7,
      rps_includes_carbon_capture: 0,
      rps_includes_nuclear_energy: 0,
      storage_allowed: 1,
      nuclear_allowed: 1,
    };

    schema = {
      dimensions: [
        'solar_price',
        'wind_price',
        'nuclear_price',
        'ng_price',
        'carbon_tax',
        'rps',
        'rps_includes_carbon_capture',
        'rps_includes_nuclear_energy',
        'nuclear_allowed',
        'storage_allowed',
      ],
      facts: [
        'co2',
        'cost',
      ],
      scales: {
        solar_price: [0, 1, 2],
        wind_price: [0, 1, 2],
        nuclear_price: [0, 1, 2],
        ng_price: [0, 1, 2],
        carbon_tax: [0, 1, 2],
        rps: [0, 1, 2],
        rps_includes_carbon_capture: [0, 1, 2],
        rps_includes_nuclear_energy: [0, 1, 2],
        nuclear_allowed: [0, 1, 2],
        storage_allowed: [0, 1, 2],
      },
      shape: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      baseline: null,
      population: null,
    };

    fakeLocation = <Location>{
      origin: 'http://www.foobar.com',
      pathname: '/foo/bar',
      search: '?state=null_token'
    };

    currentUrl = fakeLocation.origin + fakeLocation.pathname + fakeLocation.search;

    fakeHistory = <History>{
      replaceState: (data: {}, title: string, url: string) => {
        currentUrl = url;
      }
    };
  });

  it('app state token encode/decode round trip.', () => {
    const state = {
      policy: policy
    };

    const stateToken = share.encodeStateToken(state, schema);
    const decodedState = share.decodeStateToken(stateToken, schema);

    expect(decodedState).toEqual(state);
  });

  it('update browser url to have current app state encoded via token.', () => {
    const appState = {
      policy: policy
    };

    expect(currentUrl).toEqual('http://www.foobar.com/foo/bar?state=null_token');
    share.updateUrlForAppState(
        appState,
        schema,
        fakeLocation,
        fakeHistory);
    const token = share.encodeStateToken(appState, schema);
    expect(currentUrl).toEqual(`http://www.foobar.com/foo/bar?state=${encodeURIComponent(token)}`);
  });

  it('reads the app state from the browser url with valid token.', () => {
    const appState = {
      policy: policy
    };
    const token = share.encodeStateToken(appState, schema);
    fakeLocation.search = `?state=${token}`;

    const stateFromUrl = share.readAppStateFromUrl(schema, fakeLocation);
    expect(stateFromUrl).toEqual(appState);
  });

  it('reads the app state from the browser url with no token.', () => {
    const appState = {policy: policy};
    fakeLocation.search = '';  // i.e., no query string in this case.
    const stateFromUrl = share.readAppStateFromUrl(schema, fakeLocation);
    expect(stateFromUrl).toBeNull();
  });

  it('reads the app state from the browser url with an invalid token.', () => {
    fakeLocation.search = '?state=INVALID_TOKEN';
    expect(() => share.readAppStateFromUrl(schema, fakeLocation)).toThrowError();
  });
});