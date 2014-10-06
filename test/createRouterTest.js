(function () {
  'use strict';
  var chai = require('chai');
  var expect = chai.expect;
  var mocha = require('mocha');
  var createRouter = require('../main/createRouter');

  describe('createRouter()', function () {
    
    describe('Simple call', function () {
      it('should return a route object', function (done) {

        var router = createRouter();
        expect(router).to.be.not.null;
        done();
      });
    });

  });
})();