(function () {
  'use strict';
  var chai = require('chai');
  var expect = chai.expect;
  var mocha = require('mocha');
  var mocks = require('./mocks');
  var sinon = require('sinon');
  var security = require('../main/security');
  var tokenSalt = "TOKEN_SALT";
  var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6' +
    'InRlc3RVc2VyIiwiZGF0ZSI6MTQxMzk5ODg4OTM0Mn0.a10pCGZ1cSiNpKzTSXntI1HPo5MZbNQmWzF4joKRuus'

  describe('security', function () {
    var sandbox = sinon.sandbox.create();
    var oldEnv = process.env;
    var logger = null;
    var callback = null;

    beforeEach(function () {
      process.env = {};
      logger = mocks.logger();
      callback = sinon.spy();
      security.setup(logger, tokenSalt, function(obj, done) {
        callback(obj);
        done(obj);
      });
    });

    afterEach(function () {
      sandbox.restore();
      process.env = oldEnv;
    });

    describe('isAuth()', function () {
      var req, res, next = null;

      beforeEach(function () {
        req = mocks.req();
        res = mocks.res();
        next = sinon.spy();
      });

      describe('noSetup', function () {
        it('throws Error', function (done) {
          security._unserializeCallback = null;
          security._tokenSalt = null;
          security._logger = null;
          expect(function () {
            security.isAuth(req, res, next)
          }).to.throw(Error);
          done();
        });
      });

      describe('with req.user', function () {
        it('calls next', function (done) {
          req.user = {
            name: 'testUser'
          }
          security.isAuth(req, res, next);
          expect(next.called).to.be.true;
          expect(callback.called).to.be.false;
          done();
        });
      });

      describe('headersToken', function () {
        it('calls callback and next', function (done) {
          req.headers = {};
          req.headers['x-access-token'] = token;
          security.isAuth(req, res, next);
          expect(callback.called).to.be.true;
          expect(callback.getCall(0).args[0].username).to.be.equals('testUser');
          expect(callback.getCall(0).args[0].date).to.be.above(1410000000000);
          expect(next.called).to.be.true;
          done();
        });
      });

      describe('queryToken dev', function () {
        it('calls callback and next', function (done) {
          process.env.NODE_ENV = 'development';
          req.query = {};
          req.query.token = token;
          security.isAuth(req, res, next);
          expect(callback.called).to.be.true;
          expect(callback.getCall(0).args[0].username).to.be.equals('testUser');
          expect(callback.getCall(0).args[0].date).to.be.above(1410000000000);
          expect(next.called).to.be.true;
          done();
        });
      });

      describe('queryToken nodev', function () {
        it('return 401', function (done) {
          process.env.NODE_ENV = 'production';
          req.query = {};
          req.query.token = token;
          security.isAuth(req, res, next);
          expect(callback.called).to.be.false;
          expect(res.status.called).to.be.true;
          expect(res.status.getCall(0).args[0]).to.be.equal(401);
          expect(res.send.called).to.be.true;
          expect(next.called).to.be.false;
          done();
        });
      });


      describe('bodyToken dev', function () {
        it('calls callback and next', function (done) {
          process.env.NODE_ENV = 'development';
          req.body = {};
          req.body.token = token;
          security.isAuth(req, res, next);
          expect(callback.called).to.be.true;
          expect(callback.getCall(0).args[0].username).to.be.equals('testUser');
          expect(callback.getCall(0).args[0].date).to.be.above(1410000000000);
          expect(next.called).to.be.true;
          done();
        });
      });

      describe('bodyToken nodev', function () {
        it('return 401', function (done) {
          process.env.NODE_ENV = 'production';
          req.body = {};
          req.body.token = token;
          security.isAuth(req, res, next);
          expect(callback.called).to.be.false;
          expect(res.status.called).to.be.true;
          expect(res.status.getCall(0).args[0]).to.be.equal(401);
          expect(res.send.called).to.be.true;
          expect(next.called).to.be.false;
          done();
        });
      });

      describe('jwt decode error', function () {
        it('return 400', function (done) {
          req.headers = {};
          req.headers['x-access-token'] = token;
          var jwt = require('jwt-simple');
          sandbox.stub(jwt, 'decode', function () {
            throw Error('jwtError');
          });
          security.isAuth(req, res, next);
          expect(callback.called).to.be.false;
          expect(res.status.called).to.be.true;
          expect(res.status.getCall(0).args[0]).to.be.equal(500);
          expect(res.send.called).to.be.true;
          expect(next.called).to.be.false;
          done();
        });
      });

    });

    describe('setup()', function () {
      describe('simple call', function () {
        it('configure the security instance', function (done) {
          expect(security._tokenSalt).to.be.equals(tokenSalt);
          expect(security._logger).to.be.equals(logger);
          expect(typeof security._unserializeCallback).to.be.equals('function');
          done();
        });
      });
      
      describe('missing arguments', function () {
        it('throws an error', function (done) {
          security._tokenSalt = null;
          security._logger = null;
          security._unserializeCallback = null;
          expect(function() {security.setup()}).to.throw(Error);
          done();
        });
      });

    });

    describe('token()', function () {

      describe('noSetup', function () {
        it('throws Error', function (done) {
          security._unserializeCallback = null;
          security._tokenSalt = null;
          security._logger = null;
          expect(function () {
            security.issueToken({
              username: 'testUser'
            });
          }).to.throw(Error);
          done();
        });
      });

      describe('simple call', function () {
        it('return a encoded token', function (done) {
          var testToken = security.issueToken({
            username: 'testUser',
            date: 1413998889342
          });
          expect(testToken).to.be.equals(token);
          done();
        });
      });
    });

  });
})();