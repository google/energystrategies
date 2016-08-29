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

import {App} from './app';
import * as config from './config';
import * as formatters from './formatters';
import * as util from './util';


formatters.configure();

const app = new App(
  util.shallowCopy(config.NAMED_SCENARIOS.reference, {}),
  util.shallowCopy(config.DEFAULT_SCENARIO_SPEC, {}));

document.addEventListener('DOMContentLoaded', event => {
  console.info('document.DOMContentLoaded', event);
  app.init();
});
