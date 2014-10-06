(function () {
  'use strict';
  var chai = require('chai');
  var expect = chai.expect;
  var mocha = require('mocha');
  var sinon = require('sinon');
  var fs = require('fs');
  var mocks = require('./mocks');
  var configLoader = require('../main/configLoader');

  describe('configLoader()', function () {

    var sandbox = sinon.sandbox.create();
    var fakeData = "{ \"development\": { \"dbUrl\": \"mongo://localhost/dev\"}," +
      "\"production\": { \"dbUrl\": \"mongo://localhost/prd\"}}";
    var oldEnv = process.env.NODE_ENV;
    var logger = null;
    
    beforeEach(function () {
      logger = mocks.logger();
      sandbox.restore();
    });

    afterEach(function () {
      process.env.NODE_ENV = oldEnv;
    });


    describe('Without file', function () {
      it('should return an empty config', function (done) {

        sandbox.stub(fs, 'existsSync', function (filename) {
          return false;
        });

        var config = configLoader(logger);
        expect(config).to.be.empty;
        done();
      });
    });

    describe('With file, with unset NODE_ENV', function () {
      it('should return development config', function (done) {

        delete process.env.NODE_ENV;
        sandbox.stub(fs, 'existsSync', function (filename) {
          return true;
        });
        sandbox.stub(fs, 'readFileSync', function (filename, encoding) {
          return fakeData;
        });

        var config = configLoader(logger);
        expect(config).to.be.not.empty;
        expect(config.dbUrl).to.be.equal("mongo://localhost/dev");
        done();
      });
    });

    describe('With file, with NODE_ENV="productions"', function () {
      it('should return production config', function (done) {

        process.env.NODE_ENV = "production";
        sandbox.stub(fs, 'existsSync', function (filename) {
          return true;
        });
        sandbox.stub(fs, 'readFileSync', function (filename, encoding) {
          return fakeData;
        });

        var config = configLoader(logger);
        expect(config).to.be.not.empty;
        expect(config.dbUrl).to.be.equal("mongo://localhost/prd");
        done();
      });
    });

    describe('With file, with NODE_ENV="none"', function () {
      it('should throw error', function (done) {
        process.env.NODE_ENV = "none";
        expect(configLoader).to.throw(Error);
        done();
      });
    });


  });
})();