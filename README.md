# Express Application Routes Versioning

[![Build Status](https://travis-ci.com/jgrocott/express-app-route-versioning.svg?branch=master)](https://travis-ci.com/jgrocott/express-app-route-versioning)
[![Coverage Status](https://coveralls.io/repos/github/jgrocott/express-app-route-versioning/badge.svg)](https://coveralls.io/github/jgrocott/express-app-route-versioning)


Simple node.js module provides versioning for expressjs routes/api at an application level, providing segmentation of routes, controllers and services. 

Please see [express-routes-versioning](https://github.com/Prasanna-sr/express-routes-versioning) repo for the original/alternative approach.


## Install
`npm i --save express-app-route-versioning`

## Usage

Follows semver versioning format. Supports '^, ~' symbols for matching version numbers.

```
// app.js
const express = require('express');
const router = require('./routes');

// Mount all API related routes
router(app);

app.listen(3000, () => {
   console.log(`Server listening on port 3000`);
});


// routes/index.js
const routesVersioning = require('express-app-route-versioning')();
const v100 = require('../v1.0.0/routes');
const v200 = require('../v2.0.0/routes');

const noMatchFoundCallback = (req, res, next) =>
// Version not found..
res.status(404).send(`API version is unsupported.`);

const mountRoutes = app =>
   routesVersioning({
      '1.0.0': v100,
      '2.0.0': v200,
   }, noMatchFoundCallback)(app);
   
module.exports = mountRoutes;

```
Supporting '^,~' on server might appear as an anti-pattern considering how npm versioning works, where client controls the version. Here server controls the version (or it may not), and client fully trust the server. Typically the client and server belong to the same organization in these cases.

**API**

`routesVersioning(Options, NoMatchFoundCallback)`

**Options** - object, containing version in semver format (supports ^,~ symbols) as key and function callback (connect middleware format) to invoke when the request matches the version as value. Note: Versions are expected to be mutually exclusive, as order of execution of the version couldn't be determined.

**NoMatchFoundCallback** (optional)- called if request version doesn't match the version provided in the options. If this callback is not provided latest version callback is called.


**How version is determined for each request ?**

Default behaviour is to use `accept-version` headers from the client.

This can be overridden by using a middleware and providing version in `req.version` property.

**How versions are matched ?**

semver versioning format is used to match version if versions are provided in semver format, supports ^,~ symbols on the server, else direct mapping is used (for versions like 1, 1.1)

**How does this differ from express-route-versioning**
The subtle different in this implementation is that it versions all routes at an application level, allowing for further segmentation of routes, controllers and related services. This can be best described by example.

Previously, versioning routes was done like this;
```
// ./app.js
const app = require('express')();
const router = require('./routes');

// Mount all API related routes
router(app);

app.listen(3000);


// ./routes/index.js
const AccountRouter = require('./account-router');

const mountRoutes = app => {
  app.use(`/account`, AccountRouter);
  ...
};

module.exports = mountRoutes;


// ./routes/account-router.js
const { Router } = require('express');
const AccountControllerV1 = require('../v1.0.0/controllers/account-controller');
const AccountControllerV2 = require('../v2.0.0/controllers/account-controller');
var routesVersioning = require('express-routes-versioning')();

const router = Router();

app.get('/profile', routesVersioning({
    "1.0.0": AccountControllerV1.getProfile,
    "2.0.0": AccountControllerV2.getProfile
 }));

module.exports = router;
```

Because of this tighter coupling of routes, whenever we have breaking changes we would need to update all of our routers to include the new version.

Instead, we can now update the new version in a single place;

```
// ./app.js
const app = require('express')();
const router = require('./routes');

// Mount all API related routes
router(app);

app.listen(3000);


// ./routes/index.js
const routesVersioning = require('express-routes-versioning')();
const v100 = require('../v1.0.0/routes');
const v200 = require('../v2.0.0/routes');

const mountRoutes = app =>
  routesVersioning(
    {
      '1.0.0': v100,
      '2.0.0': v200,
    }
  )(app);

module.exports = mountRoutes;

// ./v1.0.0/routes
const AccountRouter = require('./account-router');

const mountRoutes = app => {
  app.use(`/account`, AccountRouter);
  ...
};

module.exports = mountRoutes;

// ./v1.0.0/routes/account-router.js
const { Router } = require('express');
const AccountController = require('../controllers/account-controller');

const router = Router();

app.get('/profile', AccountController.getProfile);

module.exports = router;

```

## Test

`npm test`
