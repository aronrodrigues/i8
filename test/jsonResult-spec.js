(function () {
	'use strict';
	var chai = require('chai');
  var expect = chai.expect;
  var jsonResult = require('../main/jsonResult');
  var sinon = require('sinon');
  var sandbox = sinon.sandbox.create();
  var mocks = require('./mocks');

  describe('jsonResult()', function () {
  	var res = null;
  	var next = null;

    beforeEach(function (done) {
    	res = mocks.res(sandbox);
    	next = sandbox.spy();
    	done();
    });

    afterEach(function (done) {
      sandbox.restore();
      done();
    });

    describe('simple call with data and no error', function () {
      it('returns calls res.status(200).jsonp(data)', function (done) {
      	var data = { name: 'test' }
      	jsonResult(res, next)(null, data);
      	expect(res.status.calledOnce).to.be.true;
      	expect(res.status.getCall(0).args[0]).to.be.equals(200);
      	expect(res.jsonp.calledOnce).to.be.true;
      	expect(res.jsonp.getCall(0).args[0]).to.be.deep.equal(data);
	      done();
      })
    });

    describe('simple call with no data and no error', function () {
      it('returns calls res.status(204).jsonp()', function (done) {
      	jsonResult(res, next)(null, null);
      	expect(res.status.calledOnce).to.be.true;
      	expect(res.status.getCall(0).args[0]).to.be.equals(204);
      	expect(res.jsonp.calledOnce).to.be.true;
        expect(res.jsonp.getCall(0).args[0]).to.be.undefined;
	      done();
      })
    });

    describe('simple call with error', function () {
      it('returns calls next(err)', function (done) {
      	jsonResult(res, next)(new Error('testError'), null);
      	expect(res.status.called).to.be.false;
      	expect(res.jsonp.called).to.be.false;
      	expect(next.calledOnce).to.be.true;
      	expect(next.getCall(0).args[0].message).to.be.equals('testError');
	      done();
      })
    });

  });
})();