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

let initialized = false;

function initCharts() {
  c3.generate({
    bindto: '#compare-your-kwh-chart',
      size: {
        height: 200,
        width: 400
      },
      data: {
          columns: [
              ['nuclear', 59.2],
              ['natural gas', 61.0],
              ['solar', 112.4],
              ['wind', 14.4],
          ],
          type : 'donut'
      },
      donut: {
          title: "energy"
      }
  });

  c3.generate({
    bindto: '#compare-your-cost-chart',
      size: {
        height: 200,
        width: 400
      },
      data: {
          columns: [
              ['nuclear', 59.0],
              ['natural gas', 38.2],
              ['solar', 122.4],
              ['wind', 14.0],
              ['storage', 11.3],
          ],
          type : 'donut'
      },
      donut: {
          title: "cost"
      }
  });
  c3.generate({
    bindto: '#compare-to-kwh-chart',
      size: {
        height: 200,
        width: 400
      },
      data: {
          columns: [
              ['nuclear', 24.4],
              ['natural gas', 106.4],
              ['solar', 14.8],
              ['wind', 31.6],
              ['hydro', 18.0],
              ['geothermal', 10.6],
              ['biomass', 7.2],
          ],
          type : 'donut'
      },
      donut: {
          title: "energy"
      }
  });
  c3.generate({
    bindto: '#compare-to-cost-chart',
      size: {
        height: 200,
        width: 400
      },
      data: {
          columns: [
              ['nuclear', 22.7],
              ['natural gas', 68.8],
              ['solar', 16.0],
              ['wind', 32.5],
              ['hydro', 6.5],
              ['geothermal', 7.0],
              ['biomass', 7.3],
          ],
          type : 'donut'
      },
      donut: {
          title: "cost"
      }
  });
}

export function update() {
  if (!initialized) {
    initCharts();
    initialized = true;
  }
}
