const Utils = require('util');

/**
 * Gets the version of the application either from accept-version headers
 * or req.version property
 * */
function getVersion(req) {
  let version;
  if (req) {
    if (!req.version) {
      if (req.headers && req.headers['accept-version']) {
        version = req.headers['accept-version'];
      }
    } else {
      version = String(req.version);
    }
  }

  return version;
}

/**
 * Given an array of versions, returns the latest version.
 * Follows semver versioning rules.
 * Supports version types: 1, 1.0, 0.1, 1.0.0
 * Note: 1 is treated as 1.0.0
 * */
function findLatestVersion(args) {
  const versions = Object.keys(args);
  versions.sort(function(v1, v2) {
    const v1Arr = v1.split('.');
    const v2Arr = v2.split('.');
    v1Arr[0] = v1Arr[0].replace('^', '');
    v1Arr[0] = v1Arr[0].replace('~', '');
    v2Arr[0] = v2Arr[0].replace('^', '');
    v2Arr[0] = v2Arr[0].replace('~', '');

    for (let i = 0; i < 2; i++) {
      if (!v1Arr[i]) {
        v1Arr[i] = 0;
      }

      if (!v2Arr[i]) {
        v2Arr[i] = 0;
      }
    }

    if (isNaN(v2Arr[0]) || v1Arr[0] > v2Arr[0]) {
      return 1;
    }

    if (isNaN(v1Arr[0]) || v1Arr[0] < v2Arr[0]) {
      return -1;
    }

    if (isNaN(v2Arr[1]) || v1Arr[1] > v2Arr[1]) {
      return 1;
    }

    if (isNaN(v1Arr[1]) || v1Arr[1] < v2Arr[1]) {
      return -1;
    }

    if (isNaN(v2Arr[2]) || v1Arr[2] > v2Arr[2]) {
      return 1;
    }

    if (isNaN(v1Arr[2]) || v1Arr[2] < v2Arr[2]) {
      return -1;
    }

    return 0;
  });
  return versions[versions.length - 1];
}

/**
 * Determines the version to use based on the request.
 * @param {string} version
 * @param {Object} args
 */
function locateRequestedVersion(version, args) {
  const keys = Object.keys(args);
  let key;
  let tempKey;
  let versionArr;
  let tempVersion;

  for (let i = 0; i < keys.length; i++) {
    key = keys[i];
    versionArr = version.split('.');
    if (key[0] === '~') {
      tempKey = key.substr(1);
      tempKey = tempKey
        .split('.')
        .slice(0, 2)
        .join('.');
      versionArr[1] = versionArr[1] || 0;
      tempVersion = versionArr.slice(0, 2).join('.');
    } else if (key[0] === '^') {
      tempKey = key.substr(1);
      tempKey = tempKey
        .split('.')
        .slice(0, 1)
        .join('.');
      tempVersion = versionArr.slice(0, 1).join('.');
    } else {
      tempKey = key;
      versionArr[1] = versionArr[1] || 0;
      versionArr[2] = versionArr[2] || 0;
      tempVersion = versionArr.join('.');
    }

    if (tempKey === tempVersion) {
      return key;
    }
  }
}

function routesVersioning(args, notFoundMiddleware) {
  if (!args || typeof args !== 'object' || Utils.isArray(args)) {
    console.log('Input has to be an object');
    return -1;
  }

  return function(app) {
    const middlware = app.use(function(req, res, next) {
      // Get the version requested by the client
      let versionRequested = getVersion(req);

      if (!versionRequested) {
        versionRequested = findLatestVersion(args);
        // Set the current version so we avoid a redirect loop
        // req.version = versionRequested;
        req.version = versionRequested;
      } else {
        const versionFound = locateRequestedVersion(versionRequested, args);
        if (!versionFound && notFoundMiddleware) {
          // Hit the users defined not found route
          return notFoundMiddleware(req, res, next);
        }

        if (!versionFound) {
          versionRequested = findLatestVersion(args);
        } else {
          versionRequested = versionFound;
        }
      }

      // Here's where the magic happens
      const newRoute = `/${versionRequested}${req.url || ''}`;
      req.url = newRoute;
      next();
    });

    // Get a collection of all versions configured
    const routeVersionCollection = Object.entries(args);
    // Mount all routes, prefixed with the requested version
    routeVersionCollection.forEach(([routeVersion, router]) => {
      if (router) {
        app.use(`/${routeVersion}`, router);
      }
    });

    return middlware;
  };
}

module.exports = routesVersioning;
