import { execute as commonExecute, expandReferences } from 'language-common';
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


export function createEntity(params) {

  return state => {

    const { baseUrl, accessToken } = state.configuration;

    const { entityName, body } = expandReferences(params);

    const url = baseUrl.concat(entityName);
    console.log(url);

    const headers = {
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '.concat(accessToken)
    };
    console.log(headers);

    return new Promise((resolve, reject) => {
      request.post ({
        url: url,
        json: body,
        headers
      }, function(error, response, body){
        if(error) {
          reject(error);
        } else {
          console.log("Create entity succeeded.");
          resolve(body);
        }
      })
    }).then((data) => {
      const nextState = { ...state, response: { body: data } };
      if (callback) return callback(nextState);
      return nextState;
    })

  };

};

export {
  field, fields, sourceValue, alterState, each,
  merge, dataPath, dataValue, lastReferenceValue
} from 'language-common';
