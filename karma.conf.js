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

/**
 * Karma test runner configuration.
 */
module.exports = function(config) {
  config.set({
    // All file paths below are resolved relative to the following base path.
    basePath: '',

    frameworks: ['browserify', 'jasmine'],

    // Load files into the browser test sandbox in the following order.
    //
    // Note: libraries and ambient dependencies should come before tests and
    // other code that would expect them to be loaded/available.
    files: [
      {
        pattern: 'dist/lib.js',
        watched: true,
        included: true,
        served: true,
        nocache: true,
      },
      '**/*-test.ts',
    ],

    exclude: [],

    // Compile all tests and their dependencies with tsify.
    preprocessors: {
      '**/*-test.ts': ['browserify']
    },
    browserify: {
      debug: true,
      plugin: [
        'tsify'
      ]
    },

    reporters: ['progress'],

    // Karma's web server port for connecting remote browser clients.
    port: 9876,

    // Enable colors in the terminal output.
    colors: true,

    // Karma's logging level.
    logLevel: config.LOG_INFO,

    // Automatically re-run tests when source or test files are modified.
    autoWatch: true,

    // Automatically start and connect the following browsers for testing.
    browsers: ['Chrome'],

    // Keep Karma running after test suite finishes excecuting.
    singleRun: false,

    // The .ts suffix defaults to a video-based MIME-type if not specified.
    mime: {
      'text/x-typescript': ['ts']
    }
  });
};
