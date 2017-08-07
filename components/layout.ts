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

/// <reference path="../typings/index.d.ts"/>


/**
 * Initializes links to appendix pages.
 */
export function initAppendixLinks() {
  const appendixLinks = {
    about: {
      links: [
        document.getElementById('title-about-appendix'),
      ],
      button: document.getElementById('go-to-about-appendix-button')
    },
    details: {
      links: [
        document.getElementById('title-details-appendix'),
        document.getElementById('cost-slider-about-appendix'),
      ],
      button: document.getElementById('go-to-details-appendix-button')
    },
    data: {
      links: [
        document.getElementById('title-data-appendix')
      ],
      button: document.getElementById('go-to-data-appendix-button')
    },
    code: {
      links: [
        document.getElementById('title-code-appendix'),
      ],
      button: document.getElementById('go-to-code-appendix-button')
    },
  };

  // Configure appendix link behavior to trigger the modal content switch
  // via MDL tabs when clicked.
  Object.keys(appendixLinks).forEach(page => {
    const {links, button} = appendixLinks[page];
    links.forEach(link => {
      link.onclick = (event: Event) => {
        event.preventDefault();
        button.click();
      };
    })
  });
}