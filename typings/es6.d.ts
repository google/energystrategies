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


// TODO: there is a lib.es6.d.ts that contains ES6-specific typedefs.
// This is a minimal interface containing only the methods in-use.
interface ObjectConstructorES6 extends ObjectConstructor {
    /**
      * Copy the values of all of the enumerable own properties from one or more source objects to a
      * target object. Returns the target object.
      * @param target The target object to copy to.
      * @param sources One or more source objects to copy properties from.
      */
    assign(target: any, ...sources: any[]): any;
}

// TODO: decide if we can target ES6 or if we need ES6 polyfills.
//
// Object.assign = Object.assign || function(target, source) {
//     Object.keys(source).forEach(k => target[k] = source[k]);
//     return target;
// }
