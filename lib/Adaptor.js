'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lastReferenceValue = exports.dataValue = exports.dataPath = exports.merge = exports.each = exports.alterState = exports.sourceValue = exports.fields = exports.field = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.execute = execute;
exports.createEntity = createEntity;
exports.query = query;
exports.updateEntity = updateEntity;

var _languageCommon = require('language-common');

Object.defineProperty(exports, 'field', {
  enumerable: true,
  get: function get() {
    return _languageCommon.field;
  }
});
Object.defineProperty(exports, 'fields', {
  enumerable: true,
  get: function get() {
    return _languageCommon.fields;
  }
});
Object.defineProperty(exports, 'sourceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.sourceValue;
  }
});
Object.defineProperty(exports, 'alterState', {
  enumerable: true,
  get: function get() {
    return _languageCommon.alterState;
  }
});
Object.defineProperty(exports, 'each', {
  enumerable: true,
  get: function get() {
    return _languageCommon.each;
  }
});
Object.defineProperty(exports, 'merge', {
  enumerable: true,
  get: function get() {
    return _languageCommon.merge;
  }
});
Object.defineProperty(exports, 'dataPath', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataPath;
  }
});
Object.defineProperty(exports, 'dataValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.dataValue;
  }
});
Object.defineProperty(exports, 'lastReferenceValue', {
  enumerable: true,
  get: function get() {
    return _languageCommon.lastReferenceValue;
  }
});

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _url = require('url');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function execute() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  var initialState = {
    references: [],
    data: null
  };

  return function (state) {
    return _languageCommon.execute.apply(undefined, operations)(_extends({}, initialState, state));
  };
}

function createEntity(params) {

  return function (state) {

    function assembleError(_ref) {
      var response = _ref.response,
          error = _ref.error;

      if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
      if (error) return error;
      return new Error('Server responded with ' + response.statusCode);
    }

    var _state$configuration = state.configuration,
        baseUrl = _state$configuration.baseUrl,
        accessToken = _state$configuration.accessToken;

    var _expandReferences = (0, _languageCommon.expandReferences)(params)(state),
        entityName = _expandReferences.entityName,
        body = _expandReferences.body;

    var url = baseUrl.concat(entityName);

    var headers = {
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Content-Type': 'application/json',
      'Authorization': accessToken
    };

    console.log("Posting to url: " + url);
    console.log("With body: " + JSON.stringify(body, null, 2));

    return new Promise(function (resolve, reject) {
      _request2.default.post({
        url: url,
        json: body,
        headers: headers
      }, function (error, response, body) {
        error = assembleError({ error: error, response: response });
        if (error) {
          reject(error);
        } else {
          console.log("Create entity succeeded.");
          console.log(response);
          resolve(body);
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      if (callback) return callback(nextState);
      return nextState;
    });
  };
};

function query(params) {

  return function (state) {

    function assembleError(_ref2) {
      var response = _ref2.response,
          error = _ref2.error;

      if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
      if (error) return error;
      return new Error('Server responded with ' + response.statusCode);
    }

    var _state$configuration2 = state.configuration,
        baseUrl = _state$configuration2.baseUrl,
        accessToken = _state$configuration2.accessToken;

    var _expandReferences2 = (0, _languageCommon.expandReferences)(params)(state),
        entityName = _expandReferences2.entityName,
        entityId = _expandReferences2.entityId,
        query = _expandReferences2.query;

    var url = baseUrl.concat(entityName);

    var urlId = entityId ? url + '(' + entityId + ')' : url;

    // TODO: find a better way of running these ternaries.
    // Here we initialize an empty object if no query is present.
    var ternaryQuery = query || {};

    var selectors = ternaryQuery.fields ? '$select=' + query.fields.join(',') : null;
    var orderBy = ternaryQuery.orderBy ? '$orderby=' + query.orderBy.field + ' ' + query.orderBy.direction : null;
    var filter = ternaryQuery.filter ? '$filter=' + query.filter : null;
    var limit = ternaryQuery.limit ? query.limit : 0;

    var queryUrl = [selectors, orderBy, filter].filter(function (i) {
      return i != null;
    }).join('&');

    var fullUrl = queryUrl ? urlId + '?' + queryUrl : urlId;

    console.log("Full URL: " + fullUrl);

    var headers = {
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Content-Type': 'application/json',
      'Authorization': accessToken,
      'Prefer': 'odata.maxpagesize=' + limit
    };

    return new Promise(function (resolve, reject) {
      _request2.default.get({
        url: fullUrl,
        headers: headers
      }, function (error, response, body) {
        error = assembleError({ error: error, response: response });
        if (error) {
          reject(error);
        } else {
          console.log("Query succeeded.");
          console.log(body);
          resolve(body);
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      if (callback) return callback(nextState);
      return nextState;
    });
  };
};

function updateEntity(params) {

  return function (state) {

    function assembleError(_ref3) {
      var response = _ref3.response,
          error = _ref3.error;

      if (response && [200, 201, 202].indexOf(response.statusCode) > -1) return false;
      if (error) return error;
      return new Error('Server responded with ' + response.statusCode);
    }

    var _state$configuration3 = state.configuration,
        baseUrl = _state$configuration3.baseUrl,
        accessToken = _state$configuration3.accessToken;

    var _expandReferences3 = (0, _languageCommon.expandReferences)(params)(state),
        entityName = _expandReferences3.entityName,
        entityId = _expandReferences3.entityId,
        body = _expandReferences3.body;

    var url = baseUrl + entityName + "(" + entityId + ")";

    var headers = {
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Content-Type': 'application/json',
      'Authorization': accessToken
    };

    console.log("Posting to url: " + url);
    console.log("With body: " + JSON.stringify(body, null, 2));

    return new Promise(function (resolve, reject) {
      _request2.default.patch({
        url: url,
        json: body,
        headers: headers
      }, function (error, response, body) {
        error = assembleError({ error: error, response: response });
        if (error) {
          reject(error);
        } else {
          console.log("Update succeeded.");
          console.log(response);
          resolve(body);
        }
      });
    }).then(function (data) {
      var nextState = _extends({}, state, { response: { body: data } });
      if (callback) return callback(nextState);
      return nextState;
    });
  };
};
