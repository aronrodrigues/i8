(function () {
  'use strict';
  var chai = require('chai');
  var expect = chai.expect;
  var mocha = require('mocha');
  var sinon = require('sinon');
  var index = require('../main/index');

  describe('index', function () {
    it('verifies that all functions exists', function (done) {
      expect(typeof index.Server).to.be.equals('function');
      expect(typeof index.createServer).to.be.equals('function');
      expect(typeof index.createRouter).to.be.equals('function');
      expect(typeof index.createLogger).to.be.equals('function');
      expect(typeof index.security).to.be.equals('object');
      done();
    });
  });

})();