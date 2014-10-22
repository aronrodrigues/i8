(function () {
  'use strict';
  var chai = require('chai');
  var expect = chai.expect;
  var mocha = require('mocha');
  var sinon = require('sinon');
  var fs = require('fs');
  var mocks = require('./mocks');
  var appInfoLoader = require('../main/appInfoLoader');

  describe('appInfoLoader()', function () {

    var sandbox = sinon.sandbox.create();
    var fakeData = '{"name": "i8", "description": "foo bar", "version": "1.3.0"}';
      "\"production\": { \"dbUrl\": \"mongo://localhost/prd\"}}";
    var oldEnv = process.env.NODE_ENV;
    var logger = null;
    
    beforeEach(function () {
      logger = mocks.logger();
    });

    afterEach(function () {
      sandbox.restore();
      process.env.NODE_ENV = oldEnv;
    });


    describe('Without file', function () {
      it('should return an empty object', function (done) {

        sandbox.stub(fs, 'existsSync', function (filename) {
          return false;
        });

        var appInfo = appInfoLoader(logger);
        expect(appInfo).to.be.empty;
        done();
      });
    });

    describe('With file, with unset NODE_ENV', function () {
      it('should return name and version', function (done) {
        delete process.env.NODE_ENV;
        sandbox.stub(fs, 'existsSync', function (filename) {
          return true;
        });
        sandbox.stub(fs, 'readFileSync', function (filename, encoding) {
          return fakeData;
        });

        var appInfo = appInfoLoader(logger);
        expect(appInfo).to.be.not.empty;
        expect(appInfo.name).to.be.equal("i8");
        expect(appInfo.version).to.be.equal("1.3.0");
        expect(appInfo.environment).to.be.undefined;
        done();
      });
    });

    describe('With file, with NODE_ENV="production"', function () {
      it('returns name, version and environment ', function (done) {

        process.env.NODE_ENV = "production";
        sandbox.stub(fs, 'existsSync', function (filename) {
          return true;
        });
        sandbox.stub(fs, 'readFileSync', function (filename, encoding) {
          return fakeData;
        });

        var appInfo = appInfoLoader(logger);
        expect(appInfo).to.be.not.empty;
        expect(appInfo.name).to.be.equal('i8');
        expect(appInfo.version).to.be.equal('1.3.0');
        expect(appInfo.environment).to.be.equal('production');
        done();
      });
    });
    
  });
})();