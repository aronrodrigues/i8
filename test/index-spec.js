(function () {
  'use strict';
  var chai = require('chai');
  var expect = chai.expect;
  var mocha = require('mocha');
  var sinon = require('sinon');
  
  var sandbox = sinon.sandbox.create();
  var mocks = require('./mocks');

  describe('index', function () {
    var index = null; 
    beforeEach(function () {
      index = require('../main/index');;
    });
    afterEach(function () {
      sandbox.restore();
    });

    it('verifies that all functions exists', function (done) {
      expect(typeof index.Server).to.be.equals('function');
      expect(typeof index.handlerToRouter).to.be.equals('function');
      expect(typeof index.jsonResult).to.be.equals('function');
      expect(typeof index.configLoader).to.be.equals('function');
      expect(typeof index.configLoader).to.be.equals('createRouter');
      done();
    });
  });

})();