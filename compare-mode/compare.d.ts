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


// Comparison-related type definitions.

/**
 * A comparison data view bundles N reference views and a user view.
 */
interface CompareDataView {
  // The user-selected policy scenario.
  selection: PolicyDataView,

  // The reference policy scenarios for the selected scenario to be compared
  // against.
  comps: {[name: string]: PolicyDataView},
}

/**
 * A component that should be updated whenever the compare data view changes.
 */
interface CompareDataComponent {
  /**
   * Updates the state of the component to match the latest compare data view.
   *
   * @param view A new compare data view.
   */
  update(view: CompareDataView);
}

// A policy display name map {name: "Display name"}.
type CompareDisplayPolicyNames = {[s: string]: string};


// A single attribute of a given policy scenario.
type PolicyField = PolicyDimension | PolicyFact | 'energy';

/**
 * A struct that bundles accessors, formatters and display details for a field.
 */
interface PolicyFieldExtractor {
  // An identifier for uniquely distinguishing among fields.
  //
  // e.g., 'cost', 'rps', etc.
  field: PolicyField;

  // A display string that describes the field value.
  //
  // e.g., 'Cost impact', 'Clean energy fraction'
  title: string;

  // Function that extracts a numeric value from the policy data view.
  //
  // e.g., view => <total cost>
  extractor: {(view: PolicyDataView): number};

  // Function that formats the numeric quantity into a given string.
  //
  // e.g., 1e6 => $1M
  formatter: {(value: number): string};
}
