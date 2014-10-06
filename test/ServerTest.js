(function () {
  'use strict';
  var chai = require('chai');
  var expect = chai.expect;
  var mocha = require('mocha');
  var sinon = require('sinon');
  var mocks = require('./mocks');
  var Server = require('../main/Server');

  describe('Server', function () {
    var server, logger = null;

    beforeEach(function () {
      logger = mocks.logger();
      server = new Server(logger);
    });
    
    describe('new Server()', function () {
      describe('passing a logger', function () {
        it('returns a initialized Server instance', function (done) {
          expect(server).to.be.not.null;
          expect(server._logger).to.be.not.null;
          expect(server._app).to.be.not.null;
          done();
        });
      });

      describe('passing nothing', function (done) {
        it('throws Error', function (done) {
          expect(function () {
            new Server(null)
          }).to.throw.Error;
          done();
        });
      });
    });

    describe('server.startup()', function () {
      describe('startup()', function (done) {
        it('starts server', function (done) {
          server._app.all = sinon.spy();
          server._listenHttp = sinon.spy();
          server._listenHttps = sinon.spy();
          server.use = sinon.spy();
          server.startup();
          expect(server._started).to.be.true;
          expect(server._app.all.called).to.be.true;
          expect(server._app.all.getCall(0).args[0]).to.be.equal('*');
          expect(typeof (server._app.all.getCall(0).args[1])).to.be.equal('function');
          expect(server.use.called).to.be.true;
          expect(server.use.getCall(0).args[1]).to.be.equal('errorHandler');
          expect(server._listenHttp.called).to.be.true;
          expect(server._listenHttps.called).to.be.true;
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
    });

    describe('server._listenHttp()', function () {

      var oldEnv = process.env;
      var http = null;
      var httpServer = {};
      var sandbox = sinon.sandbox;

      beforeEach(function () {
        sandbox.create();
        http = require('http');
        httpServer.listen = sinon.spy();
        sandbox.stub(http, 'createServer').returns(httpServer);
        process.env = {};

      });

      afterEach(function () {
        sandbox.restore();
        process.env = oldEnv;
      });

      describe('_listenHttp(90, "192.168.1.7")', function (done) {
        it('calls http.listen on 192.168.1.7:90', function (done) {
          server._listenHttp(90, '192.168.1.7');
          expect(http.createServer.called).to.be.true;
          expect(httpServer.listen.called).to.be.true;
          expect(httpServer.listen.getCall(0).args[0]).to.be.equal(90);
          expect(httpServer.listen.getCall(0).args[1]).to.be.equal('192.168.1.7');
          done();
        });
      });

      describe('_listenHttp(90) no env', function (done) {
        it('calls http.listen on localhost:90', function (done) {
          server._listenHttp(90, null);
          expect(http.createServer.called).to.be.true;
          expect(httpServer.listen.called).to.be.true;
          expect(httpServer.listen.getCall(0).args[0]).to.be.equal(90);
          expect(httpServer.listen.getCall(0).args[1]).to.be.equal('localhost');
          done();
        });
      });

      describe('_listenHttp() no env', function (done) {
        it('calls http.listen on localhost:80', function (done) {
          server._listenHttp();
          expect(http.createServer.called).to.be.true;
          expect(httpServer.listen.called).to.be.true;
          expect(httpServer.listen.getCall(0).args[0]).to.be.equal(80);
          expect(httpServer.listen.getCall(0).args[1]).to.be.equal('localhost');
          done();
        });
      });

      describe('_listenHttp() env.IP = "x"', function (done) {
        it('calls http.listen on x:80', function (done) {
          process.env.IP = 'x';
          server._listenHttp();
          expect(http.createServer.called).to.be.true;
          expect(httpServer.listen.called).to.be.true;
          expect(httpServer.listen.getCall(0).args[0]).to.be.equal(80);
          expect(httpServer.listen.getCall(0).args[1]).to.be.equal('x');
          done();
        });
      });

      describe('_listenHttp() env.IP = "x" env.PORT = 8080', function (done) {
        it('calls http.listen on x:8080', function (done) {
          process.env.IP = 'x';
          process.env.PORT = 8080;
          server._listenHttp();
          expect(http.createServer.called).to.be.true;
          expect(httpServer.listen.called).to.be.true;
          expect(httpServer.listen.getCall(0).args[0]).to.be.equal(8080);
          expect(httpServer.listen.getCall(0).args[1]).to.be.equal('x');
          done();
        });
      });
    });
    
    
      describe('server._listenHttps()', function () {
        describe('_listenHttps()', function (done) {
          it('logs an error', function (done) {
            server._listenHttps();
            expect(logger.error.called).to.be.true;
            done();
          });
        });
      });

      describe('server._errorHandler()', function () {
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
            server._errorHandler(err, req, res, next);
            expect(res.status.getCall(0).args[0]).to.be.equal(500);
            expect(res.jsonp.getCall(0).args[0]).to.be.equal(err.message);
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
            server._errorHandler(err, req, res, next);
            expect(res.status.getCall(0).args[0]).to.be.equal(500);
            expect(res.jsonp.getCall(0).args[0]).to.be.equal(err.message);
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
            server._errorHandler(err, req, res, next);
            expect(res.status.called).to.be.false;
            expect(res.jsonp.getCall(0).args[0]).to.be.equal(err.message);
            expect(logger.error.called).to.be.true;
            expect(errorCallbackSpy.called).to.be.false;
            expect(res.send.called).to.be.false;
            done();
          });
        });

        describe('req.url: /test, res.statusCode: 200', function (done) {
          it('changes statusCode to 500, calls res.send w/ err.message', function (done) {
            req.url = '/test';
            server._errorHandler(err, req, res, next);
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
            server._errorHandler(err, req, res, next);
            expect(res.status.called).to.be.false;
            expect(res.jsonp.called).to.be.false;
            expect(logger.error.called).to.be.true;
            expect(errorCallbackSpy.called).to.be.true;
            expect(res.send.called).to.be.false;
            done();
          });
        });
      });

      describe('server.use()', function () {

        var sandbox = sinon.sandbox;
        var useStub = null;

        beforeEach(function () {
          sandbox.create();
          useStub = sinon.stub(server._app, 'use');
        });

        afterEach(function () {
          sandbox.restore();
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

        var sandbox = sinon.sandbox;
        var useStub = null;

        beforeEach(function () {
          sandbox.create();
          useStub = sinon.stub(server, 'use');
        });

        afterEach(function () {
          sandbox.restore();
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

    
      describe('server.register404Callback', function () {
        describe('function', function (done) {
          it('calls server.use', function (done) {
            var callback = sinon.spy();
            server.setErrorHandler(callback);
            expect(server._errorHandler).to.be.equals(callback);
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

  });
})();