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

import * as util from '../util';


/**
 * An serializable object that encapsulates the app state.
 */
interface AppState {
  policy: PolicyConfig,
  // TODO: add support for utility mode page state saving.
}


// The URL query string key used for the app state token.
//
// i.e., https://foo.com/bar?state=<state token goes here>
const STATE_TOKEN_KEY = 'state';

/**
 * Updates the browser URL to include an app state token derived from the current state.
 *
 * @param state The current application state.
 * @param schema The current policy dataset schema; used for encoding the app state.
 * @param location An object implementing the window.location interface.
 * @param history An object implementing the window.history interface.
 */
export function updateUrlForAppState(
    state: AppState,
    schema: PolicyDatasetSchema,
    location: Location,
    history: History) {
  const newUrl = generateUrl(state, schema, location);
  updateUrlNoRefresh(newUrl, history);
}

/**
 * Reads the current app state from the browser url token if it exists.
 *
 * @param schema The policy dataset schema to use for decoding the app state.
 * @param location An object implementing the window.location interface.
 * @returns The app state decoded from the URL token, or null if no state token exists.
 */
export function readAppStateFromUrl(schema: PolicyDatasetSchema, location: Location): AppState {
  const params = new URLSearchParams(location.search);
  const stateToken = params.get(STATE_TOKEN_KEY);

  if (stateToken !== null) {
    return decodeStateToken(stateToken, schema);
  } else {
    return null;
  }
}

/**
 * Encodes a string token that encapsulates all app state details.
 *
 * @param state The app state object.
 * @returns A base64-encoded (ASCII) string containing the app state details.
 */
export function encodeStateToken(state: AppState, policySchema: PolicyDatasetSchema): string {
  // Convert the config object into a vector of dimension levels with deterministic order.
  const stateVector = [];
  policySchema.dimensions.forEach(dimension => {
    stateVector.push(state.policy[dimension]);
  });

  return util.base64Encode(stateVector);
}

/**
 * Decodes the app state from a string token.
 *
 * @param stateToken A base64-encoded string containing the app state details.
 * @param policySchema The policy schema specifying required configuration dimensions.
 * @returns The decoded app state as an object.
 */
export function decodeStateToken(stateToken: string, policySchema: PolicyDatasetSchema): AppState {
  let stateVector;
  try {
    stateVector = util.base64Decode(stateToken);
  } catch (error) {
    throw new Error(`Failed to decode base-64 app state token: "${stateToken}"`);
  }

  const policy = {};
  policySchema.dimensions.forEach((dimension, i) => {
    policy[dimension] = stateVector[i];
  });

  const state: AppState = {
    policy: <PolicyConfig>policy,
  }

  // Validate the decoded state.
  policySchema.dimensions.forEach(dimension => {
    if ((<any>state).policy[dimension] === undefined) {
      throw new Error(
        'Decoded app state token is missing required policy config dimension'
        + ` "${dimension}"`);
    }
  });

  return <AppState>state;
}

/**
 * Generates a valid URL that encodes the given app state data.
 *
 * @param state The app state to encode within the URL.
 * @param schema The policy data schema to use for encoding the app state.
 * @param location An object implementing the window.location API.
 */
function generateUrl(state: AppState, schema: PolicyDatasetSchema, location: Location) {
  const params = new URLSearchParams(location.search);
  const stateToken = encodeStateToken(state, schema);
  params.set(STATE_TOKEN_KEY, stateToken);
  // Note: URLSearchParams.toString() handles url encoding reserved symbols like '='.
  return `${location.origin + location.pathname}?${params.toString()}`;
}

/**
 * Updates the browser to display the given URL without refreshing the page.
 *
 * @param newUrl The new URL for the browser to display.
 * @param history An object implementing the window.history API.
 */
function updateUrlNoRefresh(newUrl, history: History) {
  history.replaceState({}, '', newUrl);
}
