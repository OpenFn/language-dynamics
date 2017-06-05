Language Dynamics [![Build Status](https://travis-ci.org/OpenFn/language-dynamics.svg?branch=master)](https://travis-ci.org/OpenFn/language-dynamics)
=============

Language Pack for building expressions and operations to make calls to the Microsoft Dynamics API.

Documentation
-------------
## somethingDynamic

#### sample configuration
*Dynamics uses oauth2. The language-package will expect to be given a valid oauth token.
If a valid token is not provided, it will fail.
On OpenFn.org, the `CredentialService` is responsible for making sure the the oauth token is valid each time it assembles state to hand to `execute`.*
```js
{
  "configuration": {
    "baseUrl": "https://openfn.crm2.dynamics.com/",
    "apiVersion": "8.2",
    "accessToken": "Bearer blahblah"
  }
}
```

#### sample createEntity expression
```js
createEntity({
  entityName: "accounts",
  body: {
        "name": dataValue("name")(state),
        "creditonhold": false,
        "address1_latitude": 47.639583,
        "description": "This is the description of the sample account",
        "revenue": 5000000,
        "accountcategorycode": 1
  }
});
```

#### sample query expression
```js
query({
  entityName: "contacts",
  query: {
    fields: [
      'fullname',
      'birthdate'
    ],
    limit: 5,
    orderBy: {
      field: 'fullname',
      direction: 'asc'
    }
  }
});
```

[Docs](docs/index)


Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
