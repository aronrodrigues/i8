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
    var fakeData = '{ "development": { "dbUrl": "mongo://localhost/dev"},' +
      '"production": { "dbUrl": "mongo://localhost/prd"}}';
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
        expect(config).to.be.deep.equal({"dbUrl": "mongo://localhost/dev"});
        done();
      });
    });

    describe('With file, with NODE_ENV="production"', function () {
      it('should return production config', function (done) {
        process.env.NODE_ENV = "production";
        sandbox.stub(fs, 'existsSync', function (filename) {
          return true;
        });
        sandbox.stub(fs, 'readFileSync', function (filename, encoding) {
          return fakeData;
        });

        var config = configLoader(logger);
        expect(config).to.be.deep.equal({"dbUrl": "mongo://localhost/prd"});
        done();
      });
    });

    describe('With file, with NODE_ENV="none"', function () {
      it('should throw error', function (done) {
        sandbox.stub(fs, 'existsSync', function (filename) {
          return true;
        });
        sandbox.stub(fs, 'readFileSync', function (filename, encoding) {
          return fakeData;
        });
        process.env.NODE_ENV = "none";
        expect(function () { configLoader(logger) }).to.throw('cantLoadConfig');
        done();
      });
    });
    
    describe('Bug #???: File not exists and NODE_ENV is not set.', function () {
      it('should throw error', function (done) {
        delete process.env.NODE_ENV;
        sandbox.stub(fs, 'existsSync', function (filename) {
          return false;
        });
        var config = configLoader(logger);
        expect(process.env.NODE_ENV).to.be.equal('development');
        expect(config).to.be.deep.equal({});
        done();
      });
    });


  });
})();