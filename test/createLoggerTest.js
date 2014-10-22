(function () {
  'use strict';
  var chai = require('chai');
  var expect = chai.expect;
  var mocha = require('mocha');
  var createLogger = require('../main/createLogger');

  describe('createLogger()', function () {
    
    describe('Simple call', function () {
      it('should return a bunyan  logger object', function (done) {

        var logger = createLogger({name: 'testLogger'});
        expect(logger).to.be.not.null;
        expect(logger.fields.name).to.be.equal('testLogger');
        done();
      });
    });
    
    describe('No args call', function () {
      it('should return an error', function (done) {
        expect(function() {var logger = createLogger();}).to.throw(Error);
        done();
      });
    });
    
    describe('Wrong param', function () {
      it('should return an error', function (done) {
        expect(function() {var logger = createLogger({wrongParam: ':D'});}).to.throw(Error);
        done();
      });
    });

  });
})();