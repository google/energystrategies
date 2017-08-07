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

/// <reference path="../typings/index.d.ts" />

import * as sweeps from './policy-index';
import * as config from './config';
import * as util from '../util';
import {Promise} from 'es6-promise';


type ResolvePromise = {(reason: any)};
type RejectPromise = {(value: any)};

export class DatasetLoader {
  constructor() {}

  load(schemaUrl: string, scenariosUrl: string): Promise<PolicyDataset> {
    const promisedScenarios: Promise<PolicyDataTable> =  new Promise(
        this._fetchDatasetScenarios.bind(this, scenariosUrl));
    const promisedSchema: Promise<PolicyDatasetSchema> = new Promise(
        this._fetchDatasetSchema.bind(this, schemaUrl));

    // Wait for all of the pieces to be fetched.
    return Promise.all([promisedScenarios, promisedSchema])
      .then(([scenarios, schema]: [PolicyDataTable, PolicyDatasetSchema]) => {
        const dataset: PolicyDataset = {scenarios: scenarios, schema: schema};
        console.debug('[DatasetLoader] Dataset loaded.', dataset);
        return dataset;
      })
      .catch((reason: any) => {
        console.error('Failed to load policy dataset. Reason: ', reason);
        throw reason;
      });
  }

  _fetchDatasetScenarios(url: string, resolve: ResolvePromise, reject: RejectPromise) {
    d3.csv(url, (error: Error, scenarios: PolicyDataTable) => {
      if (error) {
        reject(new Error('Failed to load policy dataset scenarios.'));
      }
      console.debug(`[Retrieved] policy mode scenario dataset: `
          + `${scenarios.length} rows`);
      resolve(scenarios);
    });
  }

  _fetchDatasetSchema(url: string, resolve: ResolvePromise, reject: RejectPromise) {
    d3.json(url, (error: Error, schema: PolicyDatasetSchema) => {
      if (error) {
        reject(new Error('Failed to load policy dataset schema.'));
      }
      console.debug(`[Retrieved] policy mode dataset schema`, schema);
      resolve(schema);
    });
  }

}