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

import * as util from './util.ts';


/**
 * App-level page content router.
 *
 * Watches for URL hash change events and updates page elements to match the
 * currently specified hash tag.
 *
 * There are two types of page elements that are managed by the router:
 * 1. Elements that only display for a given route context
 * 2. Elements that have route context-specific CSS styles applied
 *
 * The router works by collecting element instances that match both buckets (1)
 * and (2) described above and then adding/removing CSS classes as necessary
 * when the route context changes.
 */
export class Router {
  // Style classes that are used by the router to manipulate route elements.
  css = {
    HIDE: 'hide-me',
    ACTIVE: 'active',
    ROUTE_ACTIVE_SELECTOR: 'route-active',
    ROUTE_CONTEXT_SELECTOR: 'route-context',
  };

  routes: string[];
  displayElements: {[s: string]: HTMLElement[]};
  activeElements: {[s: string]: HTMLElement[]};

  /**
   * Constructor.
   *
   * @param routes A list of route names to be managed by the router instance.
   */
  constructor(routes: string[]) {
    this.routes = routes;
    this.displayElements = {};
    this.activeElements = {};
  }

  /**
   * Initializes the router instance.
   *
   * Upon initialization, the router queries the DOM for elements that require
   * route-specific styling or treatment and then starts listening for route
   * change events.
   *
   * IMPORTANT: all DOM elements that should be managed by the router must be
   * instantiated before calling router.init().
   */
  init() {
    // Start listening for URL hash change events.
    window.addEventListener('hashchange', this._handleHashChanged.bind(this));

    // Collect all page elements that are route context-specific.
    this.routes.forEach(route => {
      this.displayElements[route] = util.selectElements(
          this._asRouteContextSelector(route));
      this.activeElements[route] = util.selectElements(
          this._asRouteActiveSelector(route));
    });
  }

  /**
   * Activates the route content matching the current window location.
   */
  routeToLocationHash() {
    this._showRouteElements(window.location.hash.slice(1));
  }

  /**
   * Generates a route-specific CSS query selector for route-context elements.
   *
   * @param route A route name; e.g., "high-renewables".
   * @return A query selector string.
   */
  _asRouteContextSelector(route: string): string {
    return `.${this.css.ROUTE_CONTEXT_SELECTOR}.${route}`;
  }

  /**
   * Generates a route-specific CSS query selector for route-active elements.
   *
   * @param route A route name; e.g., "high-renewables".
   * @return A query selector string.
   */
  _asRouteActiveSelector(route: string): string {
    return `.${this.css.ROUTE_ACTIVE_SELECTOR}.${route}`;
  }

  _handleHashChanged(event: HashChangeEvent) {
    const newLocation = window.location.hash;
    const newRoute = newLocation.slice(1);  // Strip the leading hash.
    console.debug(`hashchange: ${newLocation}; switching to route ${newRoute}`);
    this._showRouteElements(newRoute);
  }

  _hideAllRouteElements() {
    Object.keys(this.routes).forEach(key => {
      // Toggle display visibility for route elements.
      this.displayElements[this.routes[key]].forEach(el => {
        el.classList.add(this.css.HIDE);
      });

      // Toggle the "active" CSS class for route elements.
      this.activeElements[this.routes[key]].forEach(el => {
        el.classList.remove(this.css.ACTIVE);
      });
    });
  }

  _showRouteElements(route: string) {
    // Hide and deactivate elements for all routes.
    this._hideAllRouteElements();

    // Show only the route-context elements matching the current route.
    this.displayElements[route].forEach(el => {
      el.classList.remove(this.css.HIDE);
    });

    // Apply the active label (css class) to elements for the current route.
    this.activeElements[route].forEach(el => {
      el.classList.add(this.css.ACTIVE);
    });
  }
}