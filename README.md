Language Dynamics [![Build Status](https://travis-ci.org/OpenFn/language-dynamics.svg?branch=master)](https://travis-ci.org/OpenFn/language-dynamics)
=============

Language Pack for building expressions and operations to make calls to the Microsoft Dynamics API.

Documentation
-------------
## somethingDynamic

#### sample configuration
```js
{
  "username": "taylor@openfn.org",
  "password": "supersecret",
  "baseUrl": "https://bill.gates.com",
  "authType": "digest"
}
```

#### sample somethingDynamic expression
```js
somethingDynamic(params)
```

[Docs](docs/index)


Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
