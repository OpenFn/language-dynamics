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

    function assembleError({ response, error }) {
      if (response && ([200,201,202].indexOf(response.statusCode) > -1)) return false;
      if (error) return error;
      return new Error(`Server responded with ${response.statusCode}`)
    }

    const { resource, accessToken, apiVersion } = state.configuration;

    const { entityName, body } = expandReferences(params)(state);

    const url = `${resource}/api/data/v${apiVersion}/${entityName}`;

    const headers = {
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Content-Type': 'application/json',
      'Authorization': accessToken
    };

    console.log("Posting to url: " + url);
    console.log("With body: " + JSON.stringify(body, null, 2));


    return new Promise((resolve, reject) => {
      request.post ({
        url: url,
        json: body,
        headers
      }, function(error, response, body){
        error = assembleError({error, response})
        if(error) {
          reject(error);
        } else {
          console.log("Create entity succeeded.");
          console.log(response)
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

export function query(params) {

  return state => {

    function assembleError({ response, error }) {
      if (response && ([200,201,202].indexOf(response.statusCode) > -1)) return false;
      if (error) return error;
      return new Error(`Server responded with ${response.statusCode}`)
    }

    const { resource, accessToken, apiVersion } = state.configuration;
    const { entityName, entityId, query } = expandReferences(params)(state);

    const url = `${resource}/api/data/v${apiVersion}/${entityName}`;

    const urlId = ( entityId ? `${url}(${entityId})` : url );

    // TODO: find a better way of running these ternaries.
    // Here we initialize an empty object if no query is present.
    const ternaryQuery = query || {};

    const selectors = ( ternaryQuery.fields ? `$select=${query.fields.join(',')}` : null );
    const orderBy = ( ternaryQuery.orderBy ? `$orderby=${query.orderBy.field} ${query.orderBy.direction}` : null );
    const filter = ( ternaryQuery.filter ? `$filter=${query.filter}` : null );
    const limit = ( ternaryQuery.limit ?  query.limit : 0 );

    const queryUrl = [selectors, orderBy, filter]
                      .filter( i => {
                        return i != null
                      })
                      .join('&');

    const fullUrl = ( queryUrl ? `${urlId}?${queryUrl}` : urlId );

    console.log("Full URL: " + fullUrl);

    const headers = {
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Content-Type': 'application/json',
      'Authorization': accessToken,
      'Prefer': 'odata.maxpagesize=' + limit
    };

    return new Promise((resolve, reject) => {
      request.get ({
        url: fullUrl,
        headers
      }, function(error, response, body){
        error = assembleError({error, response})
        if(error) {
          reject(error);
        } else {
          console.log("Query succeeded.");
          console.log(body)
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

export function updateEntity(params) {

  return state => {

    function assembleError({ response, error }) {
      if (response && ([200,201,202].indexOf(response.statusCode) > -1)) return false;
      if (error) return error;
      return new Error(`Server responded with ${response.statusCode}`)
    }

    const { resource, accessToken, apiVersion } = state.configuration;

    const { entityName, entityId, body } = expandReferences(params)(state);

    const url = `${resource}/api/data/v${apiVersion}/${entityName}(${entityId})`;

    const headers = {
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Content-Type': 'application/json',
      'Authorization': accessToken
    };

    console.log("Posting to url: " + url);
    console.log("With body: " + JSON.stringify(body, null, 2));


    return new Promise((resolve, reject) => {
      request.patch ({
        url: url,
        json: body,
        headers
      }, function(error, response, body){
        error = assembleError({error, response})
        if(error) {
          reject(error);
        } else {
          console.log("Update succeeded.");
          console.log(response)
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

export function deleteEntity(params) {

  return state => {

    function assembleError({ response, error }) {
      if (response && ([200,201,202].indexOf(response.statusCode) > -1)) return false;
      if (error) return error;
      return new Error(`Server responded with ${response.statusCode}`)
    }

    const { resource, accessToken, apiVersion } = state.configuration;

    const { entityName, entityId } = expandReferences(params)(state);

    const url = `${resource}/api/data/v${apiVersion}/${entityName}(${entityId})`;

    const headers = {
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Content-Type': 'application/json',
      'Authorization': accessToken
    };

    console.log("Posting to url: " + url);

    return new Promise((resolve, reject) => {
      request.delete ({
        url: url,
        headers
      }, function(error, response, body){
        error = assembleError({error, response})
        if(error) {
          reject(error);
        } else {
          console.log("Delete succeeded.");
          console.log(response)
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
