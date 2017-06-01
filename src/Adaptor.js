import { execute as commonExecute, expandReferences } from 'language-common';
import { getThenPost, clientPost } from './Client';
import request from 'request';
import { resolve as resolveUrl } from 'url';

/** @module Adaptor */

/**
 * Execute a sequence of operations.
 * Wraps `language-common/execute`, and prepends initial state for http.
 * @example
 * execute(
 *   create('foo'),
 *   delete('bar')
 * )(state)
 * @constructor
 * @param {Operations} operations - Operations to be performed.
 * @returns {Operation}
 */
export function execute(...operations) {
  const initialState = {
    references: [],
    data: null
  }

  return state => {
    return commonExecute(...operations)({ ...initialState, ...state })
  };

}


// export function somethingDynamic(params) {
//
//   return state => {};
//
// };

export {
  field, fields, sourceValue, alterState, each,
  merge, dataPath, dataValue, lastReferenceValue
} from 'language-common';
