(function () {
	'use strict';

	var chai = require('chai');
  var expect = chai.expect;
  var mocha = require('mocha');
  var sinon = require('sinon');
  var mocks = require('./mocks');
  var Server = require('../main/Server');
  var http = require('http');

  describe('Server', function () {

    var server, logger = null;
    var oldEnv = process.env;
    var sandbox = sinon.sandbox.create();

    beforeEach(function () {
      logger = mocks.logger();
      process.env = {};
      server = new Server(logger);
    });

    afterEach(function () {
      sandbox.restore();
      process.env = oldEnv;
    });

    describe('new Server()', function () {

      describe('simple call', function () {
        it('returns a initialized Server instance', function (done) {
          expect(server).to.be.not.null;
          expect(server._app).to.be.not.null;
          expect(server._config.httpPort).to.be.equals(80);
          expect(server._config.httpsPort).to.be.equals(-1);
          expect(server._config.host).to.be.equals('localhost');
          expect(server._config.logLevel).to.be.equals('info');
          expect(logger.level.called).to.be.true;
          done();
        });
      });

      describe('passing nothing', function (done) {
        it('throws Error', function (done) {
          expect(function () {
            server = new Server(null);
          }).to.throw.Error;
          done();
        });
      });

      describe('with config file', function (done) {
        it('loads the config and sets the logLevel', function (done) {
          var fakeData = '{ "development": { "logLevel": "debug", "httpPort": 3000, "host": "skynet" } }';
          var fs = require('fs');
          sandbox.stub(fs, 'existsSync', function (filename) {
            return true;
          });
          sandbox.stub(fs, 'readFileSync', function (filename, encoding) {
            return fakeData;
          });
          logger = mocks.logger();
          server = new Server(logger);
          expect(server).to.be.not.null;
          expect(server._config.logLevel).to.be.equal('debug');
          expect(server._config.httpPort).to.be.equals(3000);
          expect(server._config.httpsPort).to.be.equals(-1);
          expect(server._config.host).to.be.equals('skynet');
          expect(logger.level.called).to.be.true;
          expect(logger.level.getCall(0).args[0]).to.be.equal('debug');
          done();
        });
      });
    });

    describe('server.use()', function () {

      var useStub = null;

      beforeEach(function () {
        useStub = sandbox.stub(server._app, 'use');
      });

      describe('url, function', function (done) {
        it('calls _app.use(url, function)', function (done) {
          var func = sinon.spy();
          server.use('/test', func);
          expect(useStub.called).to.be.true;
          expect(useStub.getCall(0).args[0]).to.be.equal('/test');
          expect(useStub.getCall(0).args[1]).to.be.equal(func);
          expect(logger.info.called).to.be.true;
          done();
        });
      });

      describe('function', function (done) {
        it('calls _app.use(function)', function (done) {
          var func = sinon.spy();
          server.use(func);
          expect(useStub.called).to.be.true;
          expect(useStub.getCall(0).args[1]).to.be.undefined;
          expect(useStub.getCall(0).args[0]).to.be.equal(func);
          expect(logger.info.called).to.be.true;
          done();
        });
      });

      describe('function, name', function (done) {
        it('calls _app.use(function)', function (done) {
          var func = sinon.spy();
          server.use(func);
          expect(useStub.called).to.be.true;
          expect(useStub.getCall(0).args[1]).to.be.undefined;
          expect(useStub.getCall(0).args[0]).to.be.equal(func);
          expect(logger.info.called).to.be.true;
          done();
        });
      });

      describe('function, server._started: true', function (done) {
        it('throws an error', function (done) {
          var func = sinon.spy();
          server._started = true;
          expect(function () {
            server.use(func)
          }).to.throw(Error);
          done();
        });
      });
    });

    describe('server.static()', function () {

      var useStub = null;

      beforeEach(function () {
        useStub = sandbox.stub(server, 'use');
      });

      describe('url, path', function (done) {
        it('calls server.use', function (done) {
          server.static('/test', 'path');
          expect(useStub.called).to.be.true;
          expect(useStub.getCall(0).args[0]).to.be.equal('/test');
          expect(typeof useStub.getCall(0).args[1]).to.be.equal('function');
          done();
        });
      });

      describe('url, path, server._started: true', function (done) {
        it('throws Error', function (done) {
          server._started = true;
          expect(function () {
            server.static('/test', 'path');
          }).to.throw(Error);
          done();
        });
      });
    });

    describe('server.getConfig()', function () {

      describe('url, path', function (done) {
        it('calls server.use', function (done) {
          var config = server.getConfig();
          expect(config.httpPort).to.be.equals(80);
          expect(config.httpsPort).to.be.equals(-1);
          expect(config.host).to.be.equals('localhost');
          expect(config.logLevel).to.be.equals('info');
          done();
        });
      });
    });

    describe('server.register404Callback', function () {

      describe('function', function (done) {
        it('calls server.use', function (done) {
          var callback = sinon.spy();
          server.register404Callback(callback);
          expect(server._404Callback).to.be.equals(callback);
          done();
        });
      });

      describe('function, server._started: true', function (done) {
        it('throws Error', function (done) {
          server._started = true;
          var callback = sinon.spy();
          expect(function () {
            server.register404Callback(callback);
          }).to.throw(Error);
          done();
        });
      });
    });

    describe('server.registerErrorCallback', function () {
      describe('function', function (done) {
        it('calls server.use', function (done) {
          var callback = sinon.spy();
          server.registerErrorCallback(callback);
          expect(server._errorCallback).to.be.equals(callback);
          done();
        });
      });

      describe('function, server._started: true', function (done) {
        it('throws Error', function (done) {
          server._started = true;
          var callback = sinon.spy();
          expect(function () {
            server.registerErrorCallback(callback);
          }).to.throw(Error);
          done();
        });
      });
    });

    describe('server.setErrorHandler', function () {
      describe('function', function (done) {
        it('calls server.use', function (done) {
          var callback = sinon.spy();
          server.setErrorHandler(callback);
          expect(server._defaultErrorHandler).to.be.equals(callback);
          done();
        });
      });

      describe('function, server._started: true', function (done) {
        it('throws Error', function (done) {
          server._started = true;
          var callback = sinon.spy();
          expect(function () {
            server.setErrorHandler(callback);
          }).to.throw(Error);
          done();
        });
      });
    });

    describe('server._defaultErrorHandler()', function () {
      var err, req, res, next = null;

      beforeEach(function () {
        err = new Error('testError');
        req = mocks.req();
        res = mocks.res();
        next = sinon.spy();
      });

      describe('req.url: /api/test, res.statusCode: 200', function (done) {
        it('changes statusCode to 500, calls res.jsonp w/ err.message', function (done) {
          req.url = '/api/test'
          server._defaultErrorHandler(err, req, res, next);
          expect(res.status.getCall(0).args[0]).to.be.equal(500);
          expect(res.jsonp.getCall(0).args[0].message).to.be.equal(err.message);
          expect(logger.error.called).to.be.true;
          expect(server._errorCallback).to.be.null;
          expect(res.send.called).to.be.false;
          done();
        });
      });

      describe('req.url: /api/test, res.statusCode: null', function (done) {
        it('changes statusCode to 500, calls res.jsonp w/ err.message', function (done) {
          req.url = '/api/test'
          res.statusCode = null;
          server._defaultErrorHandler(err, req, res, next);
          expect(res.status.getCall(0).args[0]).to.be.equal(500);
          expect(res.jsonp.getCall(0).args[0].message).to.be.equal(err.message);
          expect(logger.error.called).to.be.true;
          expect(server._errorCallback).to.be.null;
          expect(res.send.called).to.be.false;
          done();
        });
      });

      describe('req.url: /api/test, res.statusCode: 404', function (done) {
        it('do not change the statusCode, calls res.jsonp w/ err.message', function (done) {
          req.url = '/api/test'
          res.statusCode = 404;
          var errorCallbackSpy = sinon.spy();
          server.registerErrorCallback(errorCallbackSpy);
          server._defaultErrorHandler(err, req, res, next);
          expect(res.status.called).to.be.false;
          expect(res.jsonp.getCall(0).args[0].message).to.be.equal(err.message);
          expect(logger.error.called).to.be.true;
          expect(errorCallbackSpy.called).to.be.false;
          expect(res.send.called).to.be.false;
          done();
        });
      });

      describe('req.url: /test, res.statusCode: 200', function (done) {
        it('changes statusCode to 500, calls res.send w/ err.message', function (done) {
          req.url = '/test';
          server._defaultErrorHandler(err, req, res, next);
          expect(res.status.getCall(0).args[0]).to.be.equal(500);
          expect(res.jsonp.called).to.be.false;
          expect(logger.error.called).to.be.true;
          expect(server._errorCallback).to.be.null;
          expect(res.send.called).to.be.true;
          done();
        });
      });

      describe('req.url: /test, res.statusCode: 401', function (done) {
        it('changes statusCode to 500, calls callback', function (done) {
          req.url = '/test'
          res.statusCode = 401;
          var errorCallbackSpy = sinon.spy();
          server.registerErrorCallback(errorCallbackSpy);
          server._defaultErrorHandler(err, req, res, next);
          expect(res.status.called).to.be.false;
          expect(res.jsonp.called).to.be.false;
          expect(logger.error.called).to.be.true;
          expect(errorCallbackSpy.called).to.be.true;
          expect(res.send.called).to.be.false;
          done();
        });
      });
    });


    describe('server.startup()', function () {

      var httpServer = null;

      beforeEach(function () {
        httpServer = {};
        httpServer.listen = sinon.spy();
        sandbox.stub(http, 'createServer').returns(httpServer);
        server._app.all = sinon.spy();
        server.use = sinon.spy();
      });

      describe('startup()', function (done) {
        it('starts server', function (done) {
          server.startup();
          expect(server._started).to.be.true;
          expect(server._app.all.calledOnce).to.be.true;
          expect(server._app.all.getCall(0).args[0]).to.be.equal('*');
          expect(typeof (server._app.all.getCall(0).args[1])).to.be.equal('function');
          expect(server.use.called).to.be.true;
          expect(server.use.getCall(0).args[1]).to.be.equal('errorHandler');
          expect(httpServer.listen.calledOnce).to.be.true;
          expect(httpServer.listen.getCall(0).args[0]).to.be.equals(80);
          expect(httpServer.listen.getCall(0).args[1]).to.be.equals('localhost');
          done();
        });
      });

      describe('startup() twice', function (done) {
        it('throws an error', function (done) {
          server.startup();
          expect(function () {
            server.startup();
          }).to.throw(Error);
          done();
        });
      });

      describe('startup(callback)', function (done) {
        it('starts server and calls the callback', function (done) {
          var callback = sinon.spy();
          server.startup(callback);
          expect(callback.called).to.be.true;
          done();
        })
      });

      describe('startup() { httpPort: -1, httpsPort: -1 }', function (done) {
        it('throws noPort Error', function (done) {
          server._config.httpPort = -1;
          server._config.httpsPort = -1;
          var callback = sinon.spy();
          expect(function () {
            server.startup(callback);
          }).to.throw('noPort');
          expect(server._started).to.be.false;
          expect(server._app.all.called).to.be.false;
          expect(server.use.called).to.be.false;
          expect(httpServer.listen.called).to.be.false;
          expect(callback.called).to.be.false;
          done();
        });
      });

      describe('startup() { httpsPort: 443 }', function (done) {
        it('throws httpsNotImplementedYet Error', function (done) {
          server._config.httpsPort = 443;
          var callback = sinon.spy();
          expect(function () {
            server.startup('callback');
          }).to.throw('httpsNotImplementedYet');
          expect(server._started).to.be.false;
          expect(httpServer.listen.called).to.be.false;
          expect(callback.called).to.be.false;
          done();
        });
      });

      describe('startup() { httpPort: -1, httpsPort: 443 }', function (done) {
        it('throws httpsNotImplementedYet Error', function (done) {
          server._config.httpPort = -1;
          server._config.httpsPort = 443;
          var callback = sinon.spy();
          expect(function () {
            server.startup('callback');
          }).to.throw('httpsNotImplementedYet');
          expect(server._started).to.be.false;
          expect(httpServer.listen.called).to.be.false;
          expect(callback.called).to.be.false;
          done();
        });
      });

    });

    describe('server._default404Handler()', function () {
      var req, res, next = null;

      beforeEach(function () {
        req = mocks.req();
        res = mocks.res();
        next = sinon.spy();
      });

      describe('no registred callback callback', function (done) {
        it('changes statusCode to 404, calls next w/ notFound error', function (done) {
          server._default404Handler(req, res, next);
          expect(res.status.getCall(0).args[0]).to.be.equal(404);
          expect(next.calledOnce).to.be.equal(true);
          expect(next.getCall(0).args[0].message).to.be.equal('notFound');
          expect(res.send.called).to.be.false;
          done();
        });
      });

      describe('no registred callback callback', function (done) {
        it('changes statusCode to 404, calls next w/ notFound error', function (done) {
          server._404Callback = sinon.spy();
          server._default404Handler(req, res, next);
          expect(res.status.called).to.be.false;
          expect(next.called).to.be.false;
          expect(res.send.called).to.be.false;
          expect(server._404Callback.calledOnce).to.be.true;
          done();
        });
      });

    })

  });

})();