const assert = require('assert');
const sinon = require('sinon');
const routesVersioning = require('./../index');

describe('routes versioning', function() {
  let req;
  let res;
  let next;
  let app;
  let use;
  beforeEach(function() {
    req = {};
    res = {};
    next = function() {};

    use = function(cb) {
      cb(req, res, next);
    };

    app = { request: {}, use };
  });
  it('calling routesVersioning should return connect style middleware', function() {
    const middleware = routesVersioning({});
    assert.equal(typeof middleware, 'function');
  });
  it('calling routesVersioning with invalid input, should thrown an error', function() {
    assert.equal(routesVersioning([]), -1);
    assert.equal(routesVersioning(null), -1);
    assert.equal(routesVersioning(''), -1);
  });

  it('if version is not provided by client, call NoMatchFoundCallback if provided', function() {
    const NoMatchFoundSpy = sinon.spy();
    const middleware = routesVersioning({}, NoMatchFoundSpy);
    middleware(app);
    assert.ok(NoMatchFoundSpy.calledOnce);
    assert.ok(NoMatchFoundSpy.calledWith(req, res, next));
  });

  it('if version if not provided by client, and NoMatchFoundCallback is not provided, latest version callback should be called', function() {
    const latestVersionSpy = sinon.spy();
    routesVersioning({
      '1.2.1': sinon.spy(),
      '1.3.1': latestVersionSpy,
    })(app);
    assert.ok(latestVersionSpy.calledOnce);
    assert.ok(latestVersionSpy.calledWith(app));
  });

  it('if accept-version header is present, appropriate callback should be called', function() {
    const NoMatchFoundSpy = sinon.spy();
    const version1Spy = sinon.spy();
    const version2Spy = sinon.spy();
    routesVersioning(
      {
        '0.0.1': version1Spy,
        '1.3.1': version2Spy,
      },
      NoMatchFoundSpy
    )(app);
    app.request.headers = {};
    app.request.headers['accept-version'] = '0.0.1';
    assert.ok(version1Spy.calledOnce);
    assert.ok(version1Spy.calledWith(app));
    assert.ok(NoMatchFoundSpy.notCalled);
  });
  it('when multiple version are provided, matching version should be called', function() {
    const version1Spy = sinon.spy();
    const version2Spy = sinon.spy();
    const middleware = routesVersioning({
      '1.2.1': version1Spy,
      '2.3.1': version2Spy,
    });
    app.request.version = '2.3.1';
    middleware(app);
    assert.ok(version2Spy.calledOnce);
    assert.ok(version2Spy.calledWith(app));
    assert.ok(version1Spy.neverCalledWith(app));
  });
  it('when multiple version are provided, and no matching version found NoMatchFoundCallback is called', function() {
    const version1Spy = sinon.spy();
    const version2Spy = sinon.spy();
    const NoMatchFoundSpy = sinon.spy();
    const middleware = routesVersioning(
      {
        '1.2.1': version1Spy,
        '2.3.1': version2Spy,
      },
      NoMatchFoundSpy
    );
    app.request.version = '2.3.2';
    middleware(app);
    assert.ok(NoMatchFoundSpy.calledOnce);
    assert.ok(NoMatchFoundSpy.calledWith(req, res, next));
  });
  it('when multiple version are provided, and no matching version found latest version is called, but only if NoMatchFoundCallback is not provided', function() {
    const version1Spy = sinon.spy();
    const version2Spy = sinon.spy();
    const middleware = routesVersioning({
      '2.0.2': sinon.spy(),
      '~2.3.0': sinon.spy(),
      '1.2.1': version1Spy,
      '2.0.0': sinon.spy(),
      '~1.4.4': sinon.spy(),
      '1.22.0': sinon.spy(),
      '2.3.1': version2Spy,
    });
    app.request.version = '1.3.2';
    middleware(app);
    assert.ok(version2Spy.calledOnce);
    assert.ok(version2Spy.calledWith(app));
  });
  it('when ^ is used in version, version should matching appropriately', function() {
    const version1Spy = sinon.spy();
    const version2Spy = sinon.spy();
    const middleware = routesVersioning({
      '^1.2.1': version1Spy,
      '2.3.1': version2Spy,
    });
    app.request.version = '1.4.2';
    middleware(app);
    assert.ok(version1Spy.calledOnce);
    assert.ok(version1Spy.calledWith(app));
  });
  it('when ~ is used in version, version should matching appropriately', function() {
    const version1Spy = sinon.spy();
    const version2Spy = sinon.spy();
    const middleware = routesVersioning({
      '~1.2.1': version1Spy,
      '2.3.1': version2Spy,
    });
    app.request.version = '1.2.9';
    middleware(app);
    assert.ok(version1Spy.calledOnce);
    assert.ok(version1Spy.calledWith(app));
  });
  it(
    'when ~ is used in version, version should matching appropriately, ' +
      'if doesnt match, highest version should be called',
    function() {
      const version1Spy = sinon.spy();
      const version2Spy = sinon.spy();
      const middleware = routesVersioning({
        '~1.2.1': version1Spy,
        '2.3.1': version2Spy,
      });
      app.request.version = '1.3.9';
      middleware(app);
      assert.ok(version2Spy.calledOnce);
      assert.ok(version2Spy.calledWith(app));
    }
  );
  it('when version provided as integer, version should cast to string', function() {
    const version1Spy = sinon.spy();
    const middleware = routesVersioning({
      '1': version1Spy,
    });
    app.request.version = 1;
    middleware(app);
    assert.ok(version1Spy.calledOnce);
    assert.ok(version1Spy.calledWith(app));
  });
});
